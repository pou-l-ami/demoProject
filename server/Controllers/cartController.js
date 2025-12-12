import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// helper: get or create cart
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
