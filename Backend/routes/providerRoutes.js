import express from "express";
import {
  toggleAvailability,
  approveProvider,
  getAllProvidersForAdmin,
  getMyProfile,
  getActiveProviders,
  createOrUpdateProfile
} from "../controllers/providerController.js";

import { upload } from "../middlewares/uploadMiddleware.js";
import { isAuthenticated, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getActiveProviders);

router.get("/admin/all", isAuthenticated, authorizeRoles("admin"), getAllProvidersForAdmin);
router.get("/profile", isAuthenticated, authorizeRoles("provider"), getMyProfile);
router.post("/profile", isAuthenticated, authorizeRoles("provider"), createOrUpdateProfile);
router.patch("/availability", isAuthenticated, authorizeRoles("provider"), toggleAvailability);
router.put(
  "/update", 
  isAuthenticated, 
  authorizeRoles("provider"),
  upload.fields([
    { name: 'profileImage', maxCount: 1 }, 
    { name: 'document', maxCount: 1 }
  ]), 
  createOrUpdateProfile
);
router.patch("/:profileId/approve", isAuthenticated, authorizeRoles("admin"), approveProvider);
router.get("/admin/providers", isAuthenticated, authorizeRoles("admin"), getAllProvidersForAdmin);

export default router;