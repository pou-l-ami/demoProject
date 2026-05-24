// server/Controllers/recommendationController.js
import Product from "../models/Product.js";
import { mockProductsList } from "./productController.js";
import mongoose from "mongoose";

/**
 * Get intelligent recommendations for venues, catering, decoration, and products
 * POST /api/v1/recommendation
 */
export const getRecommendations = async (req, res) => {
  try {
    const { budget, eventType, guestCount, location } = req.body;

    if (!budget || !eventType || !guestCount || !location) {
      return res.status(400).json({
        success: false,
        message: "Missing required inputs: budget, eventType, guestCount, and location are required."
      });
    }

    // Format the payload for the Python ML Engine
    const flaskPayload = {
      budget: Number(budget),
      event_type: String(eventType),
      guest_count: Number(guestCount),
      location: String(location)
    };

    console.log("Calling Python ML Engine with payload:", flaskPayload);

    // Call the Python Flask service (running on port 5000)
    let response;
    try {
      response = await fetch("http://127.0.0.1:5000/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(flaskPayload)
      });
    } catch (fetchError) {
      console.error("Failed to connect to Python Flask service:", fetchError.message);
      return res.status(503).json({
        success: false,
        message: "The Intelligent Recommendation Engine is currently starting up or offline. Please try again in a few seconds."
      });
    }

    const result = await response.json();

    if (result.status === "error" || !response.ok) {
      return res.status(response.status || 400).json({
        success: false,
        message: result.message || "Failed to retrieve recommendations from the ML engine."
      });
    }

    // Lookup corresponding MongoDB database products to assign dynamic _ids for Cart actions
    try {
      const isDbConnected = mongoose.connection.readyState === 1;
      let dbProducts = [];
      if (isDbConnected) {
        dbProducts = await Product.find({});
      }

      if (result.recommendations && result.recommendations.products) {
        result.recommendations.products = result.recommendations.products.map(p => {
          // 1) Match with MongoDB Database Products if online
          const dbMatch = dbProducts.find(dp => dp.name.toLowerCase() === p.product_name.toLowerCase());
          if (dbMatch) {
            return {
              ...p,
              _id: dbMatch._id.toString(),
              dbProduct: dbMatch
            };
          }
          // 2) Fallback to Mock Products list
          const mockMatch = mockProductsList.find(mp => mp.name.toLowerCase() === p.product_name.toLowerCase());
          if (mockMatch) {
            return {
              ...p,
              _id: mockMatch._id,
              dbProduct: mockMatch
            };
          }
          // 3) Final safeguard if product not in either list
          return {
            ...p,
            _id: `mock_prod_${p.product_name.replace(/\s+/g, "_").toLowerCase()}`
          };
        });
      }
    } catch (dbError) {
      console.warn("Failed to map MongoDB products in recommendationController:", dbError.message);
    }

    // Return the successful recommendations back to the client
    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error("Error in getRecommendations controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while processing event recommendations."
    });
  }
};
