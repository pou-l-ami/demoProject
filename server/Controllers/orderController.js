import Cart from "../models/Cart.js";
import Order from "../models/Order.js";

// POST /api/orders/checkout  (user – create order from cart)
export const checkoutCart = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    const cart = await Cart.findOne({ user: userId }).populate(
      "items.product"
    );

    if (!cart || cart.items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Cart is empty" });
    }

    const items = cart.items.map((item) => ({
      product: item.product._id,
      qty: item.qty,
      price: item.product.price,
    }));

    const totalAmount = items.reduce(
      (sum, it) => sum + it.price * it.qty,
      0
    );

    const order = await Order.create({
      user: userId,
      items,
      totalAmount,
      status: "paid",
      source: "products",
    });

    // clear cart
    cart.items = [];
    await cart.save();

    return res.status(201).json({
      success: true,
      message: "Order created from cart",
      data: order,
    });
  } catch (err) {
    console.error("checkoutCart error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Checkout failed",
    });
  }
};

// GET /api/orders/my  (user – see own orders)
export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    const orders = await Order.find({ user: userId, source: "products" })
      .populate("items.product")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (err) {
    console.error("getMyOrders error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch orders",
    });
  }
};
