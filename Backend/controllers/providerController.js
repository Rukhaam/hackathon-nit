import fs from "fs";
import { cloudinary } from "../config/cloudinary.js";
import {
  insertProviderProfile,
  getProviderByUserId,
  updateProviderProfileInDB,
  toggleAvailabilityInDB,
  approveProviderInDB,
  getAllApprovedProviders,
  getAllProvidersDB,
} from "../models/providerModel.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrorMiddleware.js";
import { ErrorHandler } from "../middlewares/errorMiddleware.js";

export const createOrUpdateProfile = catchAsyncErrors(
  async (req, res, next) => {
    const { categoryId, bio, serviceArea, basePrice } = req.body;
    const userId = req.user.id;

    if (!categoryId || !bio || !serviceArea || basePrice === undefined) {
      return next(
        new ErrorHandler(
          "Category ID, bio, service area, and base price are required",
          400
        )
      );
    }

    let profileImage = undefined;
    let documentUrl = undefined;

    // 1. Upload Profile Image to Cloudinary (If provided)
    if (req.files && req.files.profileImage) {
      const imageResult = await cloudinary.uploader.upload(
        req.files.profileImage[0].path,
        { folder: "localhub/profiles" }
      );
      profileImage = imageResult.secure_url;
      fs.unlinkSync(req.files.profileImage[0].path); // Remove temp file from server
    }

    // 2. Upload Verification Document (PDF) to Cloudinary (If provided)
    if (req.files && req.files.document) {
      const docResult = await cloudinary.uploader.upload(
        req.files.document[0].path,
        { 
          folder: "localhub/documents",
          resource_type: "auto" // Crucial: required to accept .pdf files
        }
      );
      documentUrl = docResult.secure_url;
      fs.unlinkSync(req.files.document[0].path); // Remove temp file from server
    }

    const existingProfile = await getProviderByUserId(userId);

    if (existingProfile) {
      // Build dynamic update object
      const updateData = {
        category_id: categoryId,
        bio: bio,
        service_area: serviceArea,
        base_price: basePrice,
      };

      if (profileImage) updateData.profile_image = profileImage;
      
      if (documentUrl) {
        updateData.document_url = documentUrl;
        updateData.is_approved = 0; // Force re-approval if they upload a new document
      }

      await updateProviderProfileInDB(userId, updateData);
      
      return res.status(200).json({ 
        success: true, 
        message: documentUrl 
          ? "Profile updated. Waiting for admin approval for your new document." 
          : "Profile updated successfully" 
      });

    } else {
      // Create new basic profile
      await insertProviderProfile(
        userId,
        categoryId,
        bio,
        serviceArea,
        basePrice
      );

      // If files were uploaded during creation, attach them immediately
      if (profileImage || documentUrl) {
        const fileUpdateData = {};
        if (profileImage) fileUpdateData.profile_image = profileImage;
        if (documentUrl) fileUpdateData.document_url = documentUrl;
        
        await updateProviderProfileInDB(userId, fileUpdateData);
      }

      return res.status(201).json({
        success: true,
        message: "Profile created successfully. Waiting for admin approval.",
      });
    }
  }
);

export const toggleAvailability = catchAsyncErrors(async (req, res, next) => {
  const { isAvailable } = req.body;
  const userId = req.user.id;

  if (typeof isAvailable !== "boolean") {
    return next(
      new ErrorHandler("isAvailable must be a boolean (true or false)", 400)
    );
  }

  const profile = await getProviderByUserId(userId);
  if (!profile)
    return next(new ErrorHandler("Please create a profile first", 404));

  await toggleAvailabilityInDB(userId, isAvailable);

  res.status(200).json({
    success: true,
    message: `You are now ${isAvailable ? "available" : "unavailable"} for jobs.`,
  });
});

export const approveProvider = catchAsyncErrors(async (req, res, next) => {
  const { isApproved } = req.body;
  const { profileId } = req.params;

  if (typeof isApproved !== "boolean") {
    return next(new ErrorHandler("isApproved must be a boolean", 400));
  }

  // Map boolean to MySQL TINYINT (1 or 0)
  const approvalStatus = isApproved ? 1 : 0;

  await approveProviderInDB(profileId, approvalStatus);

  res.status(200).json({
    success: true,
    message: `Provider has been ${isApproved ? "approved" : "unapproved"}.`,
  });
});

export const getActiveProviders = catchAsyncErrors(async (req, res, next) => {
  const categoryId = req.query.categoryId || null; 
  const serviceArea = req.query.serviceArea || null; 
  
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 9; 
  const offset = (page - 1) * limit;

  console.log(`[SEARCH] Category: ${categoryId}, Area: ${serviceArea}, Page: ${page}`);

  const { providers, totalCount } = await getAllApprovedProviders(categoryId, serviceArea, limit, offset);

  const totalPages = Math.ceil(totalCount / limit);

  res.status(200).json({ 
    success: true, 
    pagination: {
      totalCount,
      totalPages,
      currentPage: page,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    providers 
  });
});

export const getMyProfile = catchAsyncErrors(async (req, res, next) => {
  const profile = await getProviderByUserId(req.user.id);
  res.status(200).json({ success: true, profile: profile || null });
});

export const getAllProvidersForAdmin = catchAsyncErrors(
  async (req, res, next) => {
    const providers = await getAllProvidersDB();

    res.status(200).json({
      success: true,
      count: providers.length,
      providers,
    });
  }
);