import express from "express";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  seedProducts,
} from "../Controllers/productController.js";
import { verifyAdmin } from "../utils/verifyToken.js";

const router = express.Router();

// Public: list products
router.get("/", getProducts);

// Admin: CRUD
router.post("/", verifyAdmin, createProduct);
router.put("/:id", verifyAdmin, updateProduct);
router.delete("/:id", verifyAdmin, deleteProduct);

// Admin: seed sample products once
router.post("/seed", verifyAdmin, seedProducts);

export default router;
