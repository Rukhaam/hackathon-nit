import { body, validationResult } from "express-validator";
import { ErrorHandler } from "./errorMiddleware.js";

// 1. The Validation Engine

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = errors
      .array()
      .map((err) => err.msg)
      .join(", ");
    return next(new ErrorHandler(extractedErrors, 400));
  }
  next();
};

export const registerRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ max: 50 })
    .withMessage("Name cannot exceed 50 characters"),
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("role")
    .optional()
    .isIn(["customer", "provider", "admin"])
    .withMessage("Invalid role type"),
];

export const loginRules = [
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

// 3. Rules for Bookings
export const bookingRules = [
  body("providerId").isInt().withMessage("Provider ID must be a valid number"),
  body("categoryId").isInt().withMessage("Category ID must be a valid number"),
  body("address").trim().notEmpty().withMessage("Address is required"),
  body("scheduledDate")
    .isISO8601()
    .withMessage("Please provide a valid date format (YYYY-MM-DD HH:mm:ss)")
    .toDate(),
  body("notes").optional().trim().escape(),
];

// 4. Rules for Reviews
export const reviewRules = [
  body("bookingId").isInt().withMessage("Booking ID must be a valid number"),
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be a whole number between 1 and 5"),
  body("comment").optional().trim().escape(),
];
