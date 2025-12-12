import express from "express";
import {
  getMyCart,
  addToCart,
  removeFromCart,
} from "../Controllers/cartController.js";
import { verifyUser } from "../utils/verifyToken.js";

const router = express.Router();

// all cart actions are for logged-in user
router.get("/", verifyUser, getMyCart);
router.post("/add", verifyUser, addToCart);
router.post("/remove", verifyUser, removeFromCart);

export default router;
