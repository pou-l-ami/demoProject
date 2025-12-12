import express from "express";
import { createOrder, verifyPayment } from "../Controllers/paymentController.js";
import { verifyUser } from "../utils/verifyToken.js"; // you already have this

const router = express.Router();

// user must be logged in
router.post("/create-order", verifyUser, createOrder);
router.post("/verify", verifyUser, verifyPayment);

export default router;
