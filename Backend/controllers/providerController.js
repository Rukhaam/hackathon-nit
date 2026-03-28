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

    const existingProfile = await getProviderByUserId(userId);

    if (existingProfile) {
      await updateProviderProfileInDB(
        userId,
        categoryId,
        bio,
        serviceArea,
        basePrice
      );
      return res
        .status(200)
        .json({ success: true, message: "Profile updated successfully" });
    } else {
      await insertProviderProfile(
        userId,
        categoryId,
        bio,
        serviceArea,
        basePrice
      );
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

  await approveProviderInDB(profileId, isApproved);

  res.status(200).json({
    success: true,
    message: `Provider has been ${isApproved ? "approved" : "unapproved"}.`,
  });
});

export const getActiveProviders = catchAsyncErrors(async (req, res, next) => {
  // 1. Extract filters from the query URL
  const categoryId = req.query.categoryId || null; 
  const serviceArea = req.query.serviceArea || null; 
  
  // 2. Extract pagination details
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 9; // 9 items per page for a 3x3 grid
  const offset = (page - 1) * limit;

  // 3. Log to your terminal so you can see it working!
  console.log(`[SEARCH] Category: ${categoryId}, Area: ${serviceArea}, Page: ${page}`);

  // 4. Fetch the data from the model
  const { providers, totalCount } = await getAllApprovedProviders(categoryId, serviceArea, limit, offset);

  const totalPages = Math.ceil(totalCount / limit);

  // 5. Send payload WITH pagination object
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
