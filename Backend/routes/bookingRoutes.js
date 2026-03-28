import express from "express";
import {
  requestBooking,
  updateBookingStatus,
  completeJob,
  getMyBookings,
  rescheduleBooking,
  updateBookingPrice
} from "../controllers/bookingController.js";
import {
  isAuthenticated,
  authorizeRoles,
} from "../middlewares/authMiddleware.js";
import { upload } from "../config/cloudinary.js"; 
import {
  validateRequest,
  bookingRules,
} from "../middlewares/validatorsMiddleware.js";

const router = express.Router();

router.use(isAuthenticated);

router.get("/", getMyBookings);

router.post(
  "/",
  authorizeRoles("customer"),
  bookingRules,
  validateRequest,
  requestBooking
);
router.patch(
  "/:id/price",
  authorizeRoles("provider"), 
  updateBookingPrice
);
router.patch(
  "/:id/status",
  authorizeRoles("customer", "provider"),
  updateBookingStatus
);

router.patch(
  "/:id/complete",
  authorizeRoles("provider"),
  upload.fields([
    { name: "beforeImage", maxCount: 1 },
    { name: "afterImage", maxCount: 1 },
  ]),
  completeJob
);

router.patch(
  "/:id/reschedule",
  authorizeRoles("customer"), 
  rescheduleBooking
);

export default router;
