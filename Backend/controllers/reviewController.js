import {
  insertReview,
  getReviewsByProvider,
  getProviderAverageRating,
  getReviewByBookingId,
} from "../models/reviewModel.js";
import { getBookingById } from "../models/bookingModel.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrorMiddleware.js";
import { ErrorHandler } from "../middlewares/errorMiddleware.js";

export const createReview = catchAsyncErrors(async (req, res, next) => {
  const bookingId = req.body.bookingId || req.body.booking_id;
  const { rating, comment } = req.body;
  const customerId = req.user.id;

  if (!bookingId || !rating) {
    return next(new ErrorHandler("Booking ID and rating are required", 400));
  }

  const booking = await getBookingById(bookingId);
  if (!booking) return next(new ErrorHandler("Booking not found", 404));

  if (booking.customer_id !== customerId) {
    return next(new ErrorHandler("You did not make this booking", 403));
  }

  if (booking.status !== "Completed") {
    return next(new ErrorHandler("You can only review completed jobs", 400));
  }

  const existingReview = await getReviewByBookingId(bookingId);
  if (existingReview) {
    return next(
      new ErrorHandler("You have already reviewed this booking", 400)
    );
  }

  await insertReview(
    bookingId,
    customerId,
    booking.provider_id,
    rating,
    comment || null
  );

  res.status(201).json({
    success: true,
    message: "Review submitted successfully!",
  });
});

export const getProviderReviews = catchAsyncErrors(async (req, res, next) => {
  const providerId = req.params.providerId;

  const reviews = await getReviewsByProvider(providerId);
  const rawStats = await getProviderAverageRating(providerId);

  const totalReviews = rawStats?.totalReviews
    ? Number(rawStats.totalReviews)
    : 0;
  const averageRating = rawStats?.averageRating
    ? Number(rawStats.averageRating).toFixed(1)
    : "0.0";

  res.status(200).json({
    success: true,
    stats: {
      averageRating,
      totalReviews,
    },
    reviews,
  });
});
