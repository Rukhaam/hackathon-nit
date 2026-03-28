import {
  insertBooking,
  getBookingById,
  updateBookingStatusInDB,
  completeBookingInDB,
  getUserBookings,
  updateBookingDateInDB,
  updateBookingPriceInDB
} from "../models/bookingModel.js";
import { getProviderByUserId } from "../models/providerModel.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrorMiddleware.js";
import { ErrorHandler } from "../middlewares/errorMiddleware.js";


export const requestBooking = catchAsyncErrors(async (req, res, next) => {
  const { providerId, categoryId, phoneNumber, address, scheduledDate, notes, price } = req.body;
  const customerId = req.user.id;

  const providerProfile = await getProviderByUserId(providerId);
  if (!providerProfile || !providerProfile.is_available || !providerProfile.is_approved) {
    return next(new ErrorHandler("Provider is currently unavailable or not approved", 400));
  }

  const bookingDate = new Date(scheduledDate);
  const now = new Date(Date.now());

  if (bookingDate < now) {
    return next(new ErrorHandler("Booking date cannot be in the past", 400));
  }

  if (bookingDate - now > 15 * 24 * 60 * 60 * 1000) {
    return next(new ErrorHandler("Booking date cannot be more than 15 days in the future", 400));
  }

  const insertId = await insertBooking(
    customerId, 
    providerId, 
    categoryId, 
    phoneNumber, 
    address, 
    scheduledDate, 
    notes,
    price 
  );

  res.status(201).json({
    success: true,
    message: "Booking requested successfully. Waiting for provider to confirm.",
    bookingId: insertId
  });
});


export const updateBookingStatus = catchAsyncErrors(async (req, res, next) => {
  const { status } = req.body;
  const bookingId = req.params.id;
  const { id: userId, role } = req.user;

  const booking = await getBookingById(bookingId);
  if (!booking) return next(new ErrorHandler("Booking not found", 404));

  if (role === 'customer' && booking.customer_id !== userId) return next(new ErrorHandler("Unauthorized", 403));
  if (role === 'provider' && booking.provider_id !== userId) return next(new ErrorHandler("Unauthorized", 403));

  const validTransitions = {
    'Requested': ['Confirmed', 'Cancelled'],
    'Confirmed': ['In-progress', 'Cancelled'],
    'In-progress': ['Completed'], 
    'Completed': [],
    'Cancelled': []
  };

  if (!validTransitions[booking.status].includes(status)) {
    return next(new ErrorHandler(`Cannot change status from ${booking.status} to ${status}`, 400));
  }

  if (role === 'customer' && status !== 'Cancelled') {
    return next(new ErrorHandler("Customers can only cancel bookings.", 403));
  }

  await updateBookingStatusInDB(bookingId, status);

  res.status(200).json({ success: true, message: `Booking status updated to ${status}` });
});


export const completeJob = catchAsyncErrors(async (req, res, next) => {
  const bookingId = req.params.id;
  const userId = req.user.id;

  const booking = await getBookingById(bookingId);
  if (!booking) return next(new ErrorHandler("Booking not found", 404));
  if (booking.provider_id !== userId) return next(new ErrorHandler("Unauthorized", 403));

  if (booking.status !== 'In-progress') {
    return next(new ErrorHandler("Job must be 'In-progress' before it can be completed", 400));
  }

  const beforeImageUrl = req.files?.beforeImage ? req.files.beforeImage[0].path : null;
  const afterImageUrl = req.files?.afterImage ? req.files.afterImage[0].path : null;

  await completeBookingInDB(bookingId, beforeImageUrl, afterImageUrl);

  res.status(200).json({ success: true, message: "Job completed successfully!" });
});


export const getMyBookings = catchAsyncErrors(async (req, res, next) => {
  const bookings = await getUserBookings(req.user.id, req.user.role);
  res.status(200).json({ success: true, count: bookings.length, bookings });
});


export const rescheduleBooking = catchAsyncErrors(async (req, res, next) => {
  const bookingId = req.params.id;
  const { newDate } = req.body;
  const userId = req.user.id;

  const booking = await getBookingById(bookingId);
  if (!booking) return next(new ErrorHandler("Booking not found", 404));
  if (booking.customer_id !== userId) return next(new ErrorHandler("Unauthorized", 403));

  if (["Completed", "Cancelled"].includes(booking.status)) {
    return next(new ErrorHandler("Cannot reschedule a closed booking.", 400));
  }

  await updateBookingDateInDB(bookingId, newDate);

  res.status(200).json({ success: true, message: "Booking successfully rescheduled!" });
});



export const updateBookingPrice = catchAsyncErrors(async (req, res, next) => {
  const bookingId = req.params.id;
  const { newPrice } = req.body;
  const userId = req.user.id;

  if (!newPrice || isNaN(newPrice) || newPrice <= 0) {
    return next(new ErrorHandler("Please provide a valid price amount.", 400));
  }

  const booking = await getBookingById(bookingId);
  if (!booking) return next(new ErrorHandler("Booking not found", 404));
  
  if (booking.provider_id !== userId) return next(new ErrorHandler("Unauthorized", 403));

  if (["Completed", "Cancelled"].includes(booking.status)) {
    return next(new ErrorHandler("Cannot update the price of a closed booking.", 400));
  }

  await updateBookingPriceInDB(bookingId, newPrice);

  res.status(200).json({ success: true, message: `Price successfully updated to ₹${newPrice}` });
});