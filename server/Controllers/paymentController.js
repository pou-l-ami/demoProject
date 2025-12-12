// server/Controllers/paymentController.js
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
import Booking from "../models/Booking.js";

// make sure .env is loaded even if index.js runs later
dotenv.config();

// ⚠ Don't create Razorpay at top with undefined env
// We'll create it inside functions instead

export const createOrder = async (req, res) => {
  try {
    // create Razorpay instance here AFTER dotenv.config()
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        message:
          "Razorpay keys are missing. Check server/.env RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
      });
    }

    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    const options = {
      amount: booking.totalAmount * 100, // in paise
      currency: "INR",
      receipt: `booking_${booking._id}`,
      notes: {
        bookingId: booking._id.toString(),
        eventName: booking.eventName,
      },
    };

    const order = await razorpay.orders.create(options);

    // optionally save order id
    booking.paymentMode = "Razorpay";
    booking.razorpayOrderId = order.id;
    await booking.save();

    return res.status(201).json({
      success: true,
      message: "Order created",
      data: order,
    });
  } catch (err) {
    console.error("createOrder error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to create Razorpay order",
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
    } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (expectedSign !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment signature" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    booking.paymentStatus = "paid";
    booking.status = "confirmed";
    booking.transactionId = razorpay_payment_id;
    booking.razorpayPaymentId = razorpay_payment_id;
    booking.razorpaySignature = razorpay_signature;
    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified & booking updated",
      data: booking,
    });
  } catch (err) {
    console.error("verifyPayment error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to verify payment",
    });
  }
};
