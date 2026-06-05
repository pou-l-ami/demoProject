// server/Controllers/recommendationController.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Product from "../models/Product.js";
import { mockProductsList } from "./productController.js";
import mongoose from "mongoose";

// Setup ES Modules dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Load and parse a CSV file dynamically
 */
const loadCSV = (fileName) => {
  const filePath = path.join(__dirname, "..", "ml", fileName);
  if (!fs.existsSync(filePath)) {
    console.warn(`CSV file not found: ${filePath}`);
    return [];
  }
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    // Basic CSV splitting (safe as none of our data fields contain quotes/commas)
    const cols = line.split(",").map((c) => c.trim());
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = cols[idx] || "";
    });
    return obj;
  });
};

/**
 * Calculate token-based cosine similarity between query and item text
 */
const calculateTextSimilarity = (query, itemText) => {
  if (!query || !itemText) return 0;
  
  const stopwords = new Set(["and", "or", "the", "a", "an", "in", "on", "at", "to", "for", "with", "by"]);
  const getTokens = (str) =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((t) => t.length > 0 && !stopwords.has(t));
      
  const queryTokens = getTokens(query);
  const itemTokens = getTokens(itemText);
  
  if (queryTokens.length === 0 || itemTokens.length === 0) return 0;
  
  const querySet = new Set(queryTokens);
  const itemSet = new Set(itemTokens);
  
  let intersection = 0;
  querySet.forEach((token) => {
    if (itemSet.has(token)) {
      intersection++;
    }
  });
  
  return intersection / Math.sqrt(querySet.size * itemSet.size);
};

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

    const budgetVal = Number(budget);
    const guestCountVal = Number(guestCount);

    // Load CSV datasets
    const venues = loadCSV("venues.csv");
    const vendors = loadCSV("vendors.csv");
    const products = loadCSV("products.csv");

    if (venues.length === 0 || vendors.length === 0 || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "One or more datasets (venues, vendors, products) are empty or missing."
      });
    }

    // Sub-budget allocations: Venue 40%, Catering 30%, Decoration 20%, Products 10%
    const venue_budget = budgetVal * 0.40;
    const catering_budget = budgetVal * 0.30;
    const decoration_budget = budgetVal * 0.20;
    const product_budget = budgetVal * 0.10;

    // -------------------------------------------------------------
    // STEP 1: VENUE RECOMMENDATION
    // -------------------------------------------------------------
    // Filter by city
    let v_filtered = venues.filter((v) => v.city.toLowerCase() === location.toLowerCase());
    if (v_filtered.length === 0) {
      v_filtered = [...venues];
    }

    // Capacity filtering: capacity >= guestCountVal
    const v_capacity_filtered = v_filtered.filter((v) => Number(v.capacity) >= guestCountVal);
    if (v_capacity_filtered.length > 0) {
      v_filtered = v_capacity_filtered;
    }

    // Budget filtering: if any venues are under the allocated venue budget, only keep those
    const v_under_budget = v_filtered.filter((v) => Number(v.price_per_day) <= venue_budget);
    if (v_under_budget.length > 0) {
      v_filtered = v_under_budget;
    }

    // Score venues
    const venuesWithScores = v_filtered.map((v) => {
      const vCapacity = Number(v.capacity);
      const vPrice = Number(v.price_per_day);
      const vRating = Number(v.rating);

      const simScore = calculateTextSimilarity(eventType, `${v.venue_name} ${v.city}`);
      const ratingScore = vRating / 5.0;
      const budgetScore = vPrice <= venue_budget ? (1.0 - 0.15 * ((venue_budget - vPrice) / venue_budget)) : venue_budget / vPrice;
      const capacityScore = vCapacity < guestCountVal ? 0.0 : Math.max(0.9, guestCountVal / vCapacity);

      const finalScore = (
        0.15 * ratingScore +
        0.50 * budgetScore +
        0.15 * capacityScore +
        0.20 * simScore
      );

      return {
        ...v,
        capacity: vCapacity,
        price_per_day: vPrice,
        rating: vRating,
        finalScore
      };
    });

    venuesWithScores.sort((a, b) => b.finalScore - a.finalScore);
    const bestVenue = venuesWithScores[0];

    // -------------------------------------------------------------
    // STEP 2: VENDOR RECOMMENDATIONS (CATERING & DECORATION)
    // -------------------------------------------------------------
    // Filter vendors by city
    let vend_filtered = vendors.filter((v) => v.city.toLowerCase() === location.toLowerCase());
    if (vend_filtered.length === 0) {
      vend_filtered = [...vendors];
    }

    // 2A: Catering Services
    let caterers = vend_filtered.filter((v) => v.service_type.toLowerCase() === "catering");
    if (caterers.length === 0) {
      caterers = vendors.filter((v) => v.service_type.toLowerCase() === "catering");
    }

    // Budget filtering for caterers
    const c_under_budget = caterers.filter((c) => Number(c.package_price) <= catering_budget);
    if (c_under_budget.length > 0) {
      caterers = c_under_budget;
    }

    const caterersWithScores = caterers.map((c) => {
      const cPrice = Number(c.package_price);
      const cRating = Number(c.rating);

      const simScore = calculateTextSimilarity(eventType, `${c.service_name} catering`);
      const ratingScore = cRating / 5.0;
      const budgetScore = cPrice <= catering_budget ? (1.0 - 0.15 * ((catering_budget - cPrice) / catering_budget)) : catering_budget / cPrice;

      const finalScore = (
        0.25 * ratingScore +
        0.50 * budgetScore +
        0.25 * simScore
      );

      return {
        ...c,
        package_price: cPrice,
        rating: cRating,
        finalScore
      };
    });

    caterersWithScores.sort((a, b) => b.finalScore - a.finalScore);
    const bestCaterer = caterersWithScores[0];

    // 2B: Decoration Services
    let decorators = vend_filtered.filter((v) => v.service_type.toLowerCase() === "decoration");
    if (decorators.length === 0) {
      decorators = vendors.filter((v) => v.service_type.toLowerCase() === "decoration");
    }

    // Budget filtering for decorators
    const d_under_budget = decorators.filter((d) => Number(d.package_price) <= decoration_budget);
    if (d_under_budget.length > 0) {
      decorators = d_under_budget;
    }

    const decoratorsWithScores = decorators.map((d) => {
      const dPrice = Number(d.package_price);
      const dRating = Number(d.rating);

      const simScore = calculateTextSimilarity(eventType, `${d.service_name} decoration flowers lights`);
      const ratingScore = dRating / 5.0;
      const budgetScore = dPrice <= decoration_budget ? (1.0 - 0.15 * ((decoration_budget - dPrice) / decoration_budget)) : decoration_budget / dPrice;

      const finalScore = (
        0.25 * ratingScore +
        0.50 * budgetScore +
        0.25 * simScore
      );

      return {
        ...d,
        package_price: dPrice,
        rating: dRating,
        finalScore
      };
    });

    decoratorsWithScores.sort((a, b) => b.finalScore - a.finalScore);
    const bestDecorator = decoratorsWithScores[0];

    // -------------------------------------------------------------
    // STEP 3: PRODUCT RECOMMENDATIONS
    // -------------------------------------------------------------
    let p_filtered = products.filter((p) => p.city.toLowerCase() === location.toLowerCase());
    if (p_filtered.length === 0) {
      p_filtered = [...products];
    }

    const productsWithScores = p_filtered.map((p) => {
      const pPrice = Number(p.rental_price);
      const pRating = Number(p.rating);

      const simScore = calculateTextSimilarity(eventType, `${p.product_name} ${p.category}`);
      const ratingScore = pRating / 5.0;
      const budgetScore = pPrice <= product_budget ? (1.0 - 0.15 * ((product_budget - pPrice) / product_budget)) : product_budget / pPrice;

      const finalScore = (
        0.25 * ratingScore +
        0.50 * budgetScore +
        0.25 * simScore
      );

      return {
        ...p,
        rental_price: pPrice,
        rating: pRating,
        finalScore
      };
    });

    productsWithScores.sort((a, b) => b.finalScore - a.finalScore);
    const bestProducts = productsWithScores.slice(0, 3);

    // -------------------------------------------------------------
    // STEP 4: COST BREAKDOWN AND SUMMARY
    // -------------------------------------------------------------
    const venue_cost = bestVenue.price_per_day;
    const caterer_cost = bestCaterer.package_price;
    const decorator_cost = bestDecorator.package_price;
    const products_cost = bestProducts.reduce((sum, p) => sum + p.rental_price, 0);

    const total_estimated_cost = venue_cost + caterer_cost + decorator_cost + products_cost;
    const savings = Math.max(0.0, budgetVal - total_estimated_cost);
    const percentage_spent = budgetVal > 0 ? Math.round((total_estimated_cost / budgetVal) * 100 * 10) / 10 : 0;

    // Lookup corresponding MongoDB database products to assign dynamic _ids for Cart actions
    let mappedProducts = bestProducts;
    try {
      const isDbConnected = mongoose.connection.readyState === 1;
      let dbProducts = [];
      if (isDbConnected) {
        dbProducts = await Product.find({});
      }

      mappedProducts = bestProducts.map((p) => {
        const dbMatch = dbProducts.find((dp) => dp.name.toLowerCase() === p.product_name.toLowerCase());
        if (dbMatch) {
          return {
            ...p,
            _id: dbMatch._id.toString(),
            dbProduct: dbMatch
          };
        }
        const mockMatch = mockProductsList.find((mp) => mp.name.toLowerCase() === p.product_name.toLowerCase());
        if (mockMatch) {
          return {
            ...p,
            _id: mockMatch._id,
            dbProduct: mockMatch
          };
        }
        return {
          ...p,
          _id: `mock_prod_${p.product_name.replace(/\s+/g, "_").toLowerCase()}`
        };
      });
    } catch (dbError) {
      console.warn("Failed to map MongoDB products in recommendationController:", dbError.message);
    }

    const result = {
      status: "success",
      inputs: {
        budget: budgetVal,
        event_type: eventType,
        guest_count: guestCountVal,
        city: location
      },
      recommendations: {
        venue: {
          venue_name: bestVenue.venue_name,
          city: bestVenue.city,
          capacity: bestVenue.capacity,
          price_per_day: bestVenue.price_per_day,
          rating: bestVenue.rating,
          image: bestVenue.image
        },
        caterer: {
          service_name: bestCaterer.service_name,
          service_type: bestCaterer.service_type,
          city: bestCaterer.city,
          package_price: bestCaterer.package_price,
          rating: bestCaterer.rating,
          image: bestCaterer.image
        },
        decorator: {
          service_name: bestDecorator.service_name,
          service_type: bestDecorator.service_type,
          city: bestDecorator.city,
          package_price: bestDecorator.package_price,
          rating: bestDecorator.rating,
          image: bestDecorator.image
        },
        products: mappedProducts.map((p) => ({
          product_name: p.product_name,
          category: p.category,
          city: p.city,
          rental_price: p.rental_price,
          rating: p.rating,
          image: p.image,
          _id: p._id,
          dbProduct: p.dbProduct
        }))
      },
      pricing: {
        venue_cost,
        caterer_cost,
        decorator_cost,
        products_cost,
        total_estimated_cost,
        user_budget: budgetVal,
        savings,
        percentage_spent
      }
    };

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
