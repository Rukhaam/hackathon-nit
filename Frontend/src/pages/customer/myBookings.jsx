import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchMyBookings,
  updateBookingStatus,
  clearBookingMessages,
  rescheduleBooking, 
} from "../../redux/slices/bookingSlice";
import {
  submitReview,
  clearReviewMessages,
} from "../../redux/slices/reviewSlice";
import { Link } from "react-router-dom";
import LoadingSpinner from "../../components/common/loadingSpinner";
import { useToast } from "../../hooks/toastHook";
import {
  CalendarCheck,
  MapPin,
  CalendarClock,
  XCircle,
  Star,
  History,
  Activity,
} from "lucide-react";

export default function MyBookings() {
  const dispatch = useDispatch();
  const { showSuccess, showError, showLoading, dismissToast } = useToast();

  const { items: bookings, isLoading: bookingsLoading } = useSelector(
    (state) => state.bookings
  );
  const { isLoading: reviewLoading } = useSelector((state) => state.reviews);

  const [activeTab, setActiveTab] = useState("active");

  // Review State
  const [reviewingBooking, setReviewingBooking] = useState(null);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: "" });

  // Reschedule State
  const [reschedulingBooking, setReschedulingBooking] = useState(null);
  const [newDate, setNewDate] = useState("");

  useEffect(() => {
    dispatch(fetchMyBookings());
    return () => {
      dispatch(clearBookingMessages());
      dispatch(clearReviewMessages());
    };
  }, [dispatch]);

  const activeBookings = bookings.filter((b) =>
    ["Requested", "Confirmed", "In-progress"].includes(b.status)
  );
  const historyBookings = bookings.filter((b) =>
    ["Completed", "Cancelled"].includes(b.status)
  );
  const currentBookings =
    activeTab === "active" ? activeBookings : historyBookings;

  const handleCancelBooking = async (bookingId) => {
    if (
      window.confirm("Are you sure you want to cancel this booking request?")
    ) {
      const loadingId = showLoading("Cancelling booking...");
      const res = await dispatch(
        updateBookingStatus({ bookingId, status: "Cancelled" })
      );
      dismissToast(loadingId);

      if (!res.error) {
        showSuccess("Booking successfully cancelled. 🚫");
      } else {
        showError(res.payload || "Failed to cancel booking.");
      }
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const loadingId = showLoading("Submitting your review...");

    const payload = {
      booking_id: reviewingBooking.id,
      bookingId: reviewingBooking.id,
      provider_id: reviewingBooking.provider_id,
      providerId: reviewingBooking.provider_id,
      rating: reviewData.rating,
      comment: reviewData.comment,
    };

    const res = await dispatch(submitReview(payload))
      .unwrap()
      .catch(() => ({ error: true }));

    dismissToast(loadingId);

    if (!res.error) {
      showSuccess("Review submitted! Thank you for your feedback. 🌟");
      setReviewingBooking(null);
      setReviewData({ rating: 5, comment: "" });
    } else {
      showError("Failed to submit review. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No Date Set";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Date Pending";

    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (bookingsLoading && bookings.length === 0) {
    return (
      <LoadingSpinner fullScreen={false} message="Fetching your bookings..." />
    );
  }

  return (
    // 🌟 Notice the pt-24 md:pt-28 to clear the floating navbar, and px-4 for mobile edges
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 pt-24 md:pt-28 px-4 sm:px-6 pb-24 md:pb-12">
      
      {/* HEADER */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
          My Bookings
        </h1>
        <p className="text-sm md:text-base text-gray-500 mt-1 md:mt-2">
          Track your active service requests and past jobs.
        </p>
      </div>

      {/* TABS */}
      <div className="flex gap-6 md:gap-8 border-b border-gray-200 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <button
          onClick={() => setActiveTab("active")}
          className={`pb-3 px-1 font-bold text-xs md:text-sm transition-all border-b-2 flex items-center gap-1.5 md:gap-2 whitespace-nowrap ${
            activeTab === "active"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
          }`}
        >
          <Activity size={16} className="md:w-[18px] md:h-[18px]" />
          Active Jobs
          <span
            className={`ml-1 py-0.5 px-2 rounded-full text-[10px] md:text-xs transition-colors ${
              activeTab === "active"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {activeBookings.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-3 px-1 font-bold text-xs md:text-sm transition-all border-b-2 flex items-center gap-1.5 md:gap-2 whitespace-nowrap ${
            activeTab === "history"
              ? "border-gray-900 text-gray-900"
              : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
          }`}
        >
          <History size={16} className="md:w-[18px] md:h-[18px]" />
          Past History
          <span
            className={`ml-1 py-0.5 px-2 rounded-full text-[10px] md:text-xs transition-colors ${
              activeTab === "history"
                ? "bg-gray-200 text-gray-800"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {historyBookings.length}
          </span>
        </button>
      </div>

      {/* BOOKINGS LIST */}
      <div className="space-y-4">
        {currentBookings.length === 0 ? (
          <div className="bg-gray-50/50 rounded-2xl border border-gray-200 border-dashed p-8 md:p-16 text-center flex flex-col items-center">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100">
              {activeTab === "active" ? (
                <Activity className="w-6 h-6 md:w-8 md:h-8 text-blue-400" />
              ) : (
                <History className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
              )}
            </div>
            <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1.5">
              No {activeTab} bookings
            </h3>
            <p className="text-xs md:text-sm text-gray-500 mb-6">
              You don't have any jobs here yet.
            </p>
            {activeTab === "active" && (
              <Link
                to="/"
                className="bg-white border border-gray-200 text-gray-700 font-bold px-5 py-2 md:px-6 md:py-2.5 rounded-xl text-xs md:text-sm hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
              >
                Find a Professional
              </Link>
            )}
          </div>
        ) : (
          currentBookings.map((booking) => (
            <div
              key={booking.id}
              className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 flex flex-col md:flex-row justify-between gap-4 md:gap-6 hover:shadow-md hover:border-blue-100 transition-all"
            >
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900">
                    Booking #{booking.id}
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider border ${
                      booking.status === "Requested"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : booking.status === "Confirmed"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : booking.status === "In-progress"
                        ? "bg-purple-50 text-purple-700 border-purple-200"
                        : booking.status === "Completed"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>

                <div className="space-y-1.5 md:space-y-2">
                  <p className="text-xs md:text-sm text-gray-600 flex items-center gap-2">
                    <CalendarClock size={14} className="text-gray-400 md:w-4 md:h-4" />
                    <span className="font-semibold text-gray-700">Date:</span>{" "}
                    {formatDate(
                      booking.scheduledDate || booking.scheduled_date
                    )}
                  </p>
                  <p className="text-xs md:text-sm text-gray-600 flex items-center gap-2">
                    <MapPin size={14} className="text-gray-400 md:w-4 md:h-4" />
                    <span className="font-semibold text-gray-700">Address:</span>{" "}
                    <span className="truncate max-w-[200px] md:max-w-md">{booking.address}</span>
                  </p>

                  {booking.price > 0 && (
                    <p className="text-xs md:text-sm text-gray-600 flex items-center gap-2 mt-2">
                      <span className="font-semibold text-gray-700 px-1.5 py-0.5 bg-gray-50 rounded text-[10px] md:text-xs tracking-wide border border-gray-100">
                        FEE
                      </span>
                      <span className="font-bold text-gray-900">
                        ₹{booking.price}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col justify-center gap-2.5 shrink-0 md:w-48 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-5">
                {["Requested", "Confirmed"].includes(booking.status) && (
                  <div className="flex flex-row md:flex-col gap-2 w-full">
                    <button
                      onClick={() => {
                        setReschedulingBooking(booking);
                        const dateVal =
                          booking.scheduled_date || booking.scheduledDate;
                        if (dateVal) {
                          setNewDate(
                            new Date(dateVal).toISOString().split("T")[0]
                          );
                        }
                      }}
                      disabled={bookingsLoading}
                      className="flex-1 w-full flex items-center justify-center gap-1.5 bg-white border border-gray-200 text-gray-700 text-xs md:text-sm font-bold py-2 md:py-2.5 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      <CalendarClock size={14} className="md:w-4 md:h-4" /> Reschedule
                    </button>

                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      disabled={bookingsLoading}
                      className="flex-1 w-full flex items-center justify-center gap-1.5 bg-white border border-red-200 text-red-600 text-xs md:text-sm font-bold py-2 md:py-2.5 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <XCircle size={14} className="md:w-4 md:h-4" /> Cancel
                    </button>
                  </div>
                )}

                {booking.status === "Completed" && (
                  <button
                    onClick={() => setReviewingBooking(booking)}
                    className="w-full flex items-center justify-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-100 text-xs md:text-sm font-bold py-2.5 rounded-xl hover:bg-blue-100 hover:border-blue-200 transition-colors"
                  >
                    <Star size={14} className="fill-blue-700 md:w-4 md:h-4" /> Leave a Review
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ========================================= */}
      {/* 🌟 RESCHEDULE MODAL */}
      {/* ========================================= */}
      {reschedulingBooking && (
        <div
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 transition-all"
          onClick={() => setReschedulingBooking(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-sm md:max-w-md w-full p-6 md:p-8 relative animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-t-2xl"></div>

            <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-50 rounded-full flex items-center justify-center mb-4 border border-amber-100">
              <CalendarClock className="text-amber-500 w-5 h-5 md:w-6 md:h-6" />
            </div>

            <h3 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-1">
              Reschedule Service
            </h3>
            <p className="text-xs md:text-sm text-gray-500 mb-6">
              Pick a new date for Booking #{reschedulingBooking.id}.
            </p>

            <div className="mb-6">
              <label className="block text-xs md:text-sm font-bold text-gray-700 mb-2">
                New Date
              </label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-2.5 md:px-4 md:py-3 text-sm md:text-base bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none transition-all text-gray-700 font-medium"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setReschedulingBooking(null)}
                className="flex-1 bg-white border border-gray-200 text-gray-700 font-bold py-2.5 md:py-3 rounded-xl text-xs md:text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const loadingId = showLoading("Rescheduling...");
                  const res = await dispatch(
                    rescheduleBooking({
                      bookingId: reschedulingBooking.id,
                      newDate,
                    })
                  );

                  dismissToast(loadingId);

                  if (!res.error) {
                    showSuccess("Appointment successfully rescheduled! 📅");
                    setReschedulingBooking(null);
                  } else {
                    showError(res.payload || "Failed to reschedule.");
                  }
                }}
                disabled={!newDate || bookingsLoading}
                className="flex-1 bg-gray-900 text-white font-bold py-2.5 md:py-3 rounded-xl text-xs md:text-sm hover:bg-gray-800 transition-colors disabled:opacity-50 shadow-md"
              >
                {bookingsLoading ? "Saving..." : "Confirm Date"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* REVIEW MODAL */}
      {/* ========================================= */}
      {reviewingBooking && (
        <div
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 transition-all"
          onClick={() => setReviewingBooking(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-sm md:max-w-md w-full p-6 md:p-8 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500"></div>

            <h3 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-1">
              Rate your experience
            </h3>
            <p className="text-xs md:text-sm text-gray-500 mb-6 font-medium">
              How was the service for Booking #{reviewingBooking.id}?
            </p>

            <form onSubmit={handleReviewSubmit} className="space-y-5 md:space-y-6">
              <div>
                <label className="block text-xs md:text-sm font-bold text-gray-700 mb-2.5">
                  Your Rating
                </label>
                <div className="flex space-x-1 bg-gray-50 p-2 md:p-3 rounded-xl border border-gray-100 w-fit">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() =>
                        setReviewData({ ...reviewData, rating: star })
                      }
                      className="focus:outline-none transition-transform hover:scale-110 p-1 md:p-1.5"
                    >
                      <Star
                        className={`w-7 h-7 md:w-8 md:h-8 ${
                          reviewData.rating >= star
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-bold text-gray-700 mb-2">
                  Comment (Optional)
                </label>
                <textarea
                  rows="4"
                  className="w-full px-3 py-2.5 md:px-4 md:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-shadow text-xs md:text-sm bg-gray-50 focus:bg-white"
                  placeholder="Share details of your experience..."
                  value={reviewData.comment}
                  onChange={(e) =>
                    setReviewData({ ...reviewData, comment: e.target.value })
                  }
                ></textarea>
              </div>

              <div className="flex space-x-3 pt-2 md:pt-4">
                <button
                  type="button"
                  onClick={() => setReviewingBooking(null)}
                  className="flex-1 bg-white border border-gray-200 text-gray-700 font-bold py-2.5 md:py-3 rounded-xl text-xs md:text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="flex-1 bg-blue-600 text-white font-bold py-2.5 md:py-3 rounded-xl text-xs md:text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-md"
                >
                  {reviewLoading ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}