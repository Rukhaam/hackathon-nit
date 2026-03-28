import express from "express";
import { createReview, getProviderReviews } from "../controllers/reviewController.js";
import { isAuthenticated, authorizeRoles } from "../middlewares/authMiddleware.js";
import { validateRequest, reviewRules } from "../middlewares/validatorsMiddleware.js";

const router = express.Router();

router.get("/provider/:providerId", getProviderReviews);

router.post(
  "/", 
  isAuthenticated, 
  authorizeRoles("customer"), 
  reviewRules, 
  validateRequest, 
  createReview
);

export default router;