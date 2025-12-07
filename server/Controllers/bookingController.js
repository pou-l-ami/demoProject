import Booking from "../models/Booking.js";

// USER – create booking
export const createBooking = async (req, res) => {
  try {
    // 1) Get user id either from token (preferred) or from body (for testing)
    const userId = req.user?.id || req.body.user;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message:
          "User id is missing. You must be logged in or send a valid 'user' field in the request body.",
      });
    }

    const newBooking = new Booking({
      ...req.body,
      user: userId,
    });

    const saved = await newBooking.save();

    return res.status(201).json({
      success: true,
      message: "Booking created",
      data: saved,
    });
  } catch (err) {
    console.error("createBooking error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to create booking",
    });
  }
};

// USER – get own bookings
export const getMyBookings = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated. Login again.",
      });
    }

    const bookings = await Booking.find({ user: userId }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (err) {
    console.error("getMyBookings error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch bookings",
    });
  }
};

// ADMIN – get all bookings
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate("user", "username email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (err) {
    console.error("getAllBookings error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch all bookings",
    });
  }
};

// ADMIN – update status
export const updateBookingStatus = async (req, res) => {
  try {
    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          status: req.body.status,
          paymentStatus: req.body.paymentStatus,
        },
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Booking updated",
      data: updated,
    });
  } catch (err) {
    console.error("updateBookingStatus error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to update booking",
    });
  }
};
