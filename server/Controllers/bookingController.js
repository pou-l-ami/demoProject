// server/Controllers/bookingController.js
import Booking from "../models/Booking.js";
import mongoose from "mongoose";

// USER – create booking
export const createBooking = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.user;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User id is missing. You must be logged in.",
      });
    }

    const isDbConnected = mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(userId);

    if (!isDbConnected) {
      console.log("⚠️ MongoDB is offline. Creating booking in-memory.");
      global.mockBookings = global.mockBookings || [];

      const newBooking = {
        _id: "mock_booking_" + Date.now(),
        user: userId,
        eventName: req.body.eventName || "AI Custom Event",
        venueName: req.body.venueName || "TBD Venue",
        date: req.body.date || new Date().toISOString(),
        guests: Number(req.body.guests || 100),
        totalAmount: Number(req.body.totalAmount || 50000),
        status: req.body.status || "pending",
        paymentStatus: req.body.paymentStatus || "unpaid",
        createdAt: new Date().toISOString()
      };

      global.mockBookings.push(newBooking);

      return res.status(201).json({
        success: true,
        message: "Booking created in Offline Demo Mode!",
        data: newBooking,
      });
    }

    // Standard MongoDB flow
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

    const isDbConnected = mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(userId);

    if (!isDbConnected) {
      global.mockBookings = global.mockBookings || [];
      const bookings = global.mockBookings.filter(b => b.user.toString() === userId.toString());
      
      return res.status(200).json({
        success: true,
        count: bookings.length,
        data: bookings,
      });
    }

    // Standard MongoDB flow
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
    const isDbConnected = mongoose.connection.readyState === 1;

    if (!isDbConnected) {
      global.mockBookings = global.mockBookings || [];
      global.mockUsers = global.mockUsers || [];
      
      const bookings = global.mockBookings.map(b => {
        const foundUser = global.mockUsers.find(u => u._id.toString() === b.user.toString()) || {
          username: "Demo User",
          email: "user@evenza.com"
        };
        return {
          ...b,
          user: foundUser
        };
      });

      return res.status(200).json({
        success: true,
        count: bookings.length,
        data: bookings,
      });
    }

    // Standard MongoDB flow
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
    const isDbConnected = mongoose.connection.readyState === 1;

    if (!isDbConnected) {
      global.mockBookings = global.mockBookings || [];
      const index = global.mockBookings.findIndex(b => b._id.toString() === req.params.id.toString());
      
      if (index !== -1) {
        global.mockBookings[index].status = req.body.status;
        global.mockBookings[index].paymentStatus = req.body.paymentStatus;
        
        return res.status(200).json({
          success: true,
          message: "Booking status updated in Offline Demo Mode!",
          data: global.mockBookings[index],
        });
      }

      return res.status(404).json({
        success: false,
        message: "Booking not found in Demo Mode"
      });
    }

    // Standard MongoDB flow
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
