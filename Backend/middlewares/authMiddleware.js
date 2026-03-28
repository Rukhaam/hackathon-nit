import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { ErrorHandler } from "./errorMiddleware.js";
import { catchAsyncErrors } from "./catchAsyncErrorMiddleware.js";
import { getUserById } from "../models/userModel.js";

dotenv.config();

export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  let token;

  // 1. Check for the token in the Authorization header (Mobile App Standard)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } 

  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // If no token is found in either place, reject the request
  if (!token) {
    return next(
      new ErrorHandler("User is not authenticated. Please log in.", 401)
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await getUserById(decoded.id);

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    delete user.password;
    req.user = user;

    next();
  } catch (error) {
    return next(new ErrorHandler("Invalid or expired token. Please log in again.", 401));
  }
});

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role (${req.user.role}) is not allowed to access this resource`,
          403
        )
      );
    }
    next();
  };
};