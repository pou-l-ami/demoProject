import express from "express";
import {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBookingStatus,
} from "../Controllers/bookingController.js";
import { verifyUser, verifyAdmin } from "../utils/verifyToken.js";

const router = express.Router();

// user creates a booking (from frontend – uses JWT cookie)
router.post("/", verifyUser, createBooking);

// user sees own bookings
router.get("/my-bookings", verifyUser, getMyBookings);

// admin: all bookings
router.get("/", verifyAdmin, getAllBookings);

// admin: update booking
router.put("/:id", verifyAdmin, updateBookingStatus);

export default router;

