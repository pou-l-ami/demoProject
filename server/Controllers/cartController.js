// server/Controllers/cartController.js
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";

const mockProductsList = [
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

// helper: get or create cart in DB
const findOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate("items.product");
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
    cart = await cart.populate("items.product");
  }
  return cart;
};

// GET /api/cart  (user)
export const getMyCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated. Login again.",
      });
    }

    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected && !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please logout and login again.",
      });
    }

    if (!isDbConnected) {
      console.log("⚠️ MongoDB offline. Fetching mock cart in-memory.");
      global.mockCarts = global.mockCarts || {};
      let cart = global.mockCarts[userId];
      if (!cart) {
        cart = { user: userId, items: [] };
        global.mockCarts[userId] = cart;
      }
      return res.status(200).json({
        success: true,
        data: cart,
      });
    }

    // Standard database flow
    const cart = await findOrCreateCart(userId);

    return res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (err) {
    console.error("getMyCart error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch cart",
    });
  }
};

// POST /api/cart/add  { productId, qty }
export const addToCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated. Login again.",
      });
    }

    const { productId, qty = 1 } = req.body;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected && !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please logout and login again.",
      });
    }

    if (!isDbConnected) {
      console.log("⚠️ MongoDB offline. Adding item to in-memory mock cart.");
      global.mockCarts = global.mockCarts || {};
      let cart = global.mockCarts[userId];
      
      if (!cart) {
        cart = { user: userId, items: [] };
        global.mockCarts[userId] = cart;
      }

      // Find the product in mock list by matching ID
      const product = mockProductsList.find(
        (p) => p._id.toString() === productId.toString() || p.name.toLowerCase() === productId.toString().toLowerCase()
      );

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found in Offline Demo Mode.",
        });
      }

      const existing = cart.items.find(
        (item) => item.product._id.toString() === product._id.toString()
      );

      if (existing) {
        existing.qty += Number(qty);
      } else {
        cart.items.push({
          _id: "mock_cart_item_" + Date.now(),
          product: product,
          qty: Number(qty),
        });
      }

      return res.status(200).json({
        success: true,
        message: "Cart updated dynamically in Offline Demo Mode!",
        data: cart,
      });
    }

    // Standard database flow
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let cart = await findOrCreateCart(userId);

    const existing = cart.items.find(
      (item) => item.product._id.toString() === productId
    );

    if (existing) {
      existing.qty += qty;
    } else {
      cart.items.push({ product: productId, qty });
    }

    await cart.save();
    cart = await cart.populate("items.product");

    return res.status(200).json({
      success: true,
      message: "Cart updated",
      data: cart,
    });
  } catch (err) {
    console.error("addToCart error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to update cart",
    });
  }
};

// POST /api/cart/remove  { productId }
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated. Login again.",
      });
    }

    const { productId } = req.body;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected && !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please logout and login again.",
      });
    }

    if (!isDbConnected) {
      console.log("⚠️ MongoDB offline. Removing item from in-memory mock cart.");
      global.mockCarts = global.mockCarts || {};
      let cart = global.mockCarts[userId];

      if (cart) {
        cart.items = cart.items.filter(
          (item) => item.product._id.toString() !== productId.toString()
        );
      } else {
        cart = { user: userId, items: [] };
        global.mockCarts[userId] = cart;
      }

      return res.status(200).json({
        success: true,
        message: "Item removed from cart in Offline Demo Mode!",
        data: cart,
      });
    }

    // Standard database flow
    let cart = await findOrCreateCart(userId);

    cart.items = cart.items.filter(
      (item) => item.product._id.toString() !== productId
    );

    await cart.save();
    cart = await cart.populate("items.product");

    return res.status(200).json({
      success: true,
      message: "Item removed from cart",
      data: cart,
    });
  } catch (err) {
    console.error("removeFromCart error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to update cart",
    });
  }
};
