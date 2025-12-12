import express from "express";
import { checkoutCart, getMyOrders } from "../Controllers/orderController.js";
import { verifyUser } from "../utils/verifyToken.js";

const router = express.Router();

router.post("/checkout", verifyUser, checkoutCart);
router.get("/my", verifyUser, getMyOrders);

export default router;
