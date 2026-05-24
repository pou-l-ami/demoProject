// server/routes/recommendationRoutes.js
import express from "express";
import { getRecommendations } from "../Controllers/recommendationController.js";

const router = express.Router();

// POST /api/v1/recommendation
router.post("/", getRecommendations);

export default router;
