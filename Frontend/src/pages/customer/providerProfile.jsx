import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchActiveProviders } from "../../redux/slices/exploreSlice";
import {
  requestBooking,
  clearBookingMessages,
} from "../../redux/slices/bookingSlice";
import {
  fetchProviderReviews,
  clearReviewMessages,
} from "../../redux/slices/reviewSlice";
import { useToast } from "../../hooks/toastHook";
import { ShieldCheck } from "lucide-react";

export default function ProviderProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showSuccess, showError, showLoading, dismissToast } = useToast();

  const { user } = useSelector((state) => state.auth);
  

  const { providers, isLoading: exploring } = useSelector(
    (state) => state.explore
  );
  const { isLoading: booking } = useSelector((state) => state.bookings);
  const {
    providerReviews,
    stats,
    isLoading: reviewsLoading,
  } = useSelector((state) => state.reviews);

  const [formData, setFormData] = useState({
    phoneNumber: "",
    address: "",
    scheduledDate: "",
    notes: "",
  });

  const provider = providers.find((p) => p?.profile_id === Number(id));

  useEffect(() => {
    if (providers.length === 0) {
      dispatch(fetchActiveProviders(""));
    }
    return () => {
      dispatch(clearBookingMessages());
      dispatch(clearReviewMessages());
    };
  }, [dispatch, providers.length]);

  useEffect(() => {
    if (provider?.user_id) {
      dispatch(fetchProviderReviews(provider.user_id));
    }
  }, [dispatch, provider?.user_id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const BASE_PRICE = provider?.base_price ? Number(provider.base_price) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const bookingPayload = {
      _providerId: provider.user_id,
      categoryId: provider.category_id,
      phoneNumber: formData.phoneNumber,
      address: formData.address,
      scheduledDate: formData.scheduledDate,
      notes: formData.notes,
      price: BASE_PRICE,
    };

    const loadingId = showLoading("Confirming your booking...");

    const res = await dispatch(requestBooking(bookingPayload));
    dismissToast(loadingId);

    if (!res.error) {
      showSuccess("Booking confirmed! The provider has been notified. ✅");
      setFormData({
        phoneNumber: "",
        address: "",
        scheduledDate: "",
        notes: "",
      });

      navigate("/customer/bookings");
    } else {
      showError(res.payload || "Oops! Something went wrong with your booking.");
    }
  };

  const renderStars = (rating) => {
    return "★★★★★".slice(0, rating) + "☆☆☆☆☆".slice(0, 5 - rating);
  };

  const getLocalTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  if (exploring) {
    return (
      <div className="p-12 text-center text-gray-500 animate-pulse">
        Loading profile...
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="max-w-3xl mx-auto p-12 text-center bg-white rounded-xl shadow-sm border border-gray-100 mt-8">
        <h2 className="text-2xl font-bold text-gray-800">Provider Not Found</h2>
        <Link
          to="/"
          className="text-blue-600 font-semibold mt-4 inline-block hover:underline"
        >
          &larr; Back to Services
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 mt-4 pb-12">
      {/* PROVIDER DETAILS CARD */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {provider.name}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="bg-blue-50 text-blue-700 text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {provider.category_name}
              </span>

              {stats?.totalReviews > 0 && (
                <span className="flex items-center text-sm font-bold text-gray-700">
                  <span className="text-yellow-400 text-lg mr-1">★</span>
                  {stats.averageRating}{" "}
                  <span className="text-gray-400 font-normal ml-1">
                    ({stats.totalReviews} reviews)
                  </span>
                </span>
              )}
            </div>
          </div>
          <span className="bg-green-100 text-green-700 text-sm font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
            Available Now
          </span>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-6">
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            About this Provider
          </h3>
          <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
            {provider.bio}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* REVIEWS SECTION */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col h-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            Customer Reviews
          </h2>

          {reviewsLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-20 bg-gray-100 rounded-lg w-full"></div>
              <div className="h-20 bg-gray-100 rounded-lg w-full"></div>
            </div>
          ) : providerReviews?.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <div className="text-4xl mb-2">✨</div>
              <h3 className="text-gray-800 font-bold">No reviews yet</h3>
              <p className="text-sm text-gray-500 mt-1">
                Be the first to hire and review {provider.name}!
              </p>
            </div>
          ) : (
            <ul className="space-y-4 overflow-y-auto max-h-[400px] pr-2">
              {providerReviews?.map((review) => (
                <li
                  key={review.id}
                  className="p-4 bg-gray-50 rounded-xl border border-gray-100"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-yellow-400 text-lg tracking-widest">
                      {renderStars(review.rating)}
                    </span>
                    <span className="text-xs font-semibold text-gray-400">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {review.comment ? (
                    <p className="text-gray-700 text-sm italic">
                      "{review.comment}"
                    </p>
                  ) : (
                    <p className="text-gray-400 text-sm italic">
                      No comment provided.
                    </p>
                  )}
                  {review.customer_name && (
                    <p className="text-xs font-bold text-gray-500 mt-3">
                      — {review.customer_name}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* BOOKING FORM CARD */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 h-fit">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Request Service
          </h2>

          {user && user.id === provider.user_id ? (
            <div className="bg-gray-50 border border-gray-200 p-8 rounded-xl text-center ">
              <div className="text-4xl mb-4">👋</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                This is your profile!
              </h3>
              <p className="text-gray-500">
                You cannot book your own services.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  placeholder="123-456-7890"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  placeholder="123 Main St, City"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="scheduledDate"
                    value={formData.scheduledDate}
                    onChange={handleChange}
                    required
                    min={getLocalTodayString()}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 cursor-pointer appearance-none transition-shadow"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Describe the issue..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-shadow"
                ></textarea>
              </div>

              {/* 🌟 NEW: Pricing Summary Box */}
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 mb-6 mt-4">
                <h4 className="text-sm font-bold text-gray-900 mb-3">
                  Booking Summary
                </h4>
                <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                  <span>Base Visiting Fee</span>
                  <span className="font-semibold">₹{BASE_PRICE}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600 mb-3 pb-3 border-b border-blue-100/50">
                  <span>Platform Fee</span>
                  <span className="text-green-600 font-semibold">Free</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-gray-900">
                    Total Estimated Price
                  </span>
                  <span className="font-extrabold text-blue-600 text-lg">
                    ₹{BASE_PRICE}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-3 flex items-start gap-1.5">
                  <ShieldCheck
                    size={14}
                    className="shrink-0 text-blue-500 mt-0.5"
                  />
                  You will pay the provider directly after the job is completed.
                </p>
              </div>

              <button
                type="submit"
                disabled={booking}
                className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-70 shadow-md hover:shadow-lg"
              >
                {booking ? "Submitting..." : `Confirm Booking • ₹${BASE_PRICE}`}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
