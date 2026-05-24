// server/Controllers/productController.js
import Product from "../models/Product.js";
import mongoose from "mongoose";

export const mockProductsList = [
  { _id: "mock_prod_1", name: "Premium Banquet Chair", category: "Decoration Products", price: 150, type: "rent", photo: "/product-images/banquet-chair.png", stock: 100, description: "Comfortable banquet chair with covers" },
  { _id: "mock_prod_2", name: "Luxury Dining Table", category: "Decoration Products", price: 1200, type: "rent", photo: "/product-images/dining-table.png", stock: 50, description: "Premium wooden dining table" },
  { _id: "mock_prod_3", name: "Chafing Serving Dishes", category: "Food & Catering", price: 500, type: "rent", photo: "/product-images/chafing-dishes.png", stock: 40, description: "Stainless steel chafing dishes" },
  { _id: "mock_prod_4", name: "LED Dance Floor Lights", category: "Decoration Products", price: 3500, type: "rent", photo: "/product-images/led-lights.png", stock: 20, description: "RBG LED dance floor party lights" },
  { _id: "mock_prod_5", name: "Crystal Centerpieces", category: "Decoration Products", price: 800, type: "rent", photo: "/product-images/centerpieces.png", stock: 30, description: "Elegant crystal table centerpieces" },
  { _id: "mock_prod_6", name: "DJ Lighting Sound Rig", category: "Decoration Products", price: 8500, type: "rent", photo: "/product-images/dj-light.png", stock: 5, description: "Professional lighting & sound system" },
  { _id: "mock_prod_7", name: "Flower Garland Strings", category: "Decoration Products", price: 1200, type: "buy", photo: "/product-images/flower-garlands.png", stock: 150, description: "Vibrant flower garlands for entry gate" },
  { _id: "mock_prod_8", name: "Stage Decorative Pillars", category: "Decoration Products", price: 3000, type: "rent", photo: "/product-images/pillars.png", stock: 15, description: "Elegantly carved decorative stage pillars" },
  { _id: "mock_prod_9", name: "Drink Beverage Cooler", category: "Food & Catering", price: 1500, type: "rent", photo: "/product-images/drink-cooler.png", stock: 10, description: "Electric walk-in cooler for event beverages" },
  { _id: "mock_prod_10", name: "Stage Backdrop Frame", category: "Decoration Products", price: 6000, type: "rent", photo: "/product-images/stage-backdrop.png", stock: 8, description: "Heavy-duty steel backdrop frame for staging" }
];

// GET /api/products  (public – list all)
export const getProducts = async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (!isDbConnected) {
      console.log("⚠️ MongoDB offline. Returning in-memory mock products catalog.");
      return res.status(200).json({
        success: true,
        count: mockProductsList.length,
        data: mockProductsList,
      });
    }

    // Standard database flow
    const products = await Product.find({});
    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (err) {
    console.error("getProducts error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch products",
    });
  }
};

// (optional) ADMIN – create product manually
export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    return res.status(201).json({
      success: true,
      message: "Product created",
      data: product,
    });
  } catch (err) {
    console.error("createProduct error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to create product",
    });
  }
};

// (optional) ADMIN – update product
export const updateProduct = async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Product updated",
      data: updated,
    });
  } catch (err) {
    console.error("updateProduct error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to update product",
    });
  }
};

// (optional) ADMIN – delete product
export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Product deleted",
    });
  } catch (err) {
    console.error("deleteProduct error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to delete product",
    });
  }
};

// Seed initial products (call once)
export const seedProducts = async (req, res) => {
  try {
    await Product.deleteMany({});
    const created = await Product.insertMany(mockProductsList.map(p => {
      const { _id, ...rest } = p;
      return rest;
    }));

    return res.status(201).json({
      success: true,
      message: "Sample products seeded",
      count: created.length,
      data: created,
    });
  } catch (err) {
    console.error("seedProducts error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to seed products",
    });
  }
};
