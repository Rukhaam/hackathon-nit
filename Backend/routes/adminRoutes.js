import express from "express";
import { getAllUsers, getAllBookings,toggleUserStatus } from "../controllers/adminController.js";
import { isAuthenticated, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(isAuthenticated);
router.use(authorizeRoles("admin"));

router.get("/users", getAllUsers);
router.put('/users/:id/status',isAuthenticated, authorizeRoles('admin'), toggleUserStatus);
router.get("/bookings", getAllBookings);

export default router;