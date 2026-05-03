import { useState, useEffect, useRef } from "react";
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
import { 
  ShieldCheck, 
  Star, 
  TrendingUp, 
  Sparkles, 
  Globe, 
  Phone, 
  MapPin, 
  Calendar as CalendarIcon, 
  FileText 
} from "lucide-react";
import { aiService } from "../../api/aiApi";

export default function ProviderProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showSuccess, showError, showLoading, dismissToast } = useToast();
  
  const bookingFormRef = useRef(null);

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

  const [fairPriceData, setFairPriceData] = useState(null);
  const [isCheckingPrice, setIsCheckingPrice] = useState(false);

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

  const handlePhoneChange = (e) => {
    const sanitizedVal = e.target.value.replace(/[^0-9+\- ()]/g, "");
    setFormData({ ...formData, phoneNumber: sanitizedVal });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBlur = (field) => {
    setFormData((prev) => ({ ...prev, [field]: prev[field].trim() }));
  };

  const BASE_PRICE = provider?.base_price ? Number(provider.base_price) : 0;

  const handleCheckFairPrice = async () => {
    const city = formData.address || provider.service_area || "your area"; 
    setIsCheckingPrice(true);
    try {
      const data = await aiService.getFairPrice(provider.category_name, city);
      setFairPriceData(data);
    } catch (error) {
      console.error(error);
      showError("Could not fetch live market rates right now.");
    }
    setIsCheckingPrice(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.phoneNumber.length < 10) {
      showError("Please enter a valid phone number.");
      return;
    }

    const bookingPayload = {
      providerId: provider.user_id,
      categoryId: provider.category_id,
      phoneNumber: formData.phoneNumber.trim(),
      address: formData.address.trim(),
      scheduledDate: formData.scheduledDate,
      notes: formData.notes.trim(),
      price: BASE_PRICE,
    };

    const loadingId = showLoading("Confirming your booking...");
    const res = await dispatch(requestBooking(bookingPayload));
    dismissToast(loadingId);

    if (!res.error) {
      showSuccess("Booking confirmed! The provider has been notified. ✅");
      setFormData({ phoneNumber: "", address: "", scheduledDate: "", notes: "" });
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

  const scrollToForm = () => {
    bookingFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (exploring) {
    return (
      <div className="pt-32 pb-12 text-center text-gray-500 animate-pulse font-medium">
        Loading profile...
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="max-w-3xl mx-auto p-8 md:p-12 text-center bg-white/60 backdrop-blur-xl rounded-2xl shadow-sm border border-white/50 mt-28 mb-12 mx-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">Provider Not Found</h2>
        <Link to="/" className="text-blue-600 font-bold mt-4 inline-block hover:underline">
          &larr; Back to Services
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Soft Animated Background Blobs for Glassmorphism */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-400/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-400/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 pt-24 md:pt-28 px-4 sm:px-6 pb-40 md:pb-12 relative z-10">
        
        {/* PROVIDER DETAILS CARD */}
        <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 p-6 md:p-10 transition-all hover:bg-white/70">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                {provider.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-3">
                <span className="bg-blue-500/10 text-blue-700 text-xs md:text-sm font-extrabold px-4 py-1.5 rounded-full uppercase tracking-wider border border-blue-500/20">
                  {provider.category_name}
                </span>

                {stats?.totalReviews > 0 && (
                  <span className="flex items-center text-xs md:text-sm font-bold text-gray-800 bg-white/50 px-3 py-1.5 rounded-full border border-white/50 shadow-sm">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1.5" />
                    {stats.averageRating}{" "}
                    <span className="text-gray-500 font-medium ml-1">
                      ({stats.totalReviews})
                    </span>
                  </span>
                )}
              </div>
            </div>
            <span className="bg-emerald-500/10 text-emerald-700 text-xs md:text-sm font-extrabold px-5 py-2 rounded-full uppercase tracking-wider border border-emerald-500/20 shadow-sm">
              Available Now
            </span>
          </div>

          <div className="mt-8 md:mt-10 border-t border-gray-200/50 pt-6 md:pt-8">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3">
              About this Provider
            </h3>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
              {provider.bio}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start">
          
          {/* REVIEWS SECTION */}
          <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 p-6 md:p-8 flex flex-col h-full max-h-[600px]">
            <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-5 md:mb-6 flex items-center gap-2">
              <Star className="text-yellow-500 fill-yellow-500" /> Customer Reviews
            </h2>

            {reviewsLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-24 bg-white/40 rounded-2xl w-full border border-white/50"></div>
                <div className="h-24 bg-white/40 rounded-2xl w-full border border-white/50"></div>
              </div>
            ) : providerReviews?.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white/40 rounded-2xl border border-dashed border-gray-300">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                  <Star className="w-6 h-6 text-gray-300" />
                </div>
                <h3 className="text-gray-900 font-bold text-lg">No reviews yet</h3>
                <p className="text-sm text-gray-500 mt-1 font-medium">
                  Be the first to hire and review {provider.name}!
                </p>
              </div>
            ) : (
              <ul className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                {providerReviews?.map((review) => (
                  <li
                    key={review.id}
                    className="p-5 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/60 shadow-sm transition-all hover:bg-white/80"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-yellow-500 text-sm md:text-lg tracking-widest">
                        {renderStars(review.rating)}
                      </span>
                      <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {review.comment ? (
                      <p className="text-gray-800 text-sm italic leading-relaxed font-medium">
                        "{review.comment}"
                      </p>
                    ) : (
                      <p className="text-gray-400 text-sm italic">No comment provided.</p>
                    )}
                    {review.customer_name && (
                      <p className="text-[10px] md:text-xs font-extrabold text-gray-500 mt-4 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-4 h-px bg-gray-400"></span> {review.customer_name}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* BOOKING FORM CARD */}
          <div ref={bookingFormRef} className="bg-white/60 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 p-6 md:p-8 h-fit scroll-mt-28">
            <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-5 md:mb-6">
              Request Service
            </h2>

            {user && user.id === provider.user_id ? (
              <div className="bg-white/50 border border-white/60 p-8 rounded-2xl text-center shadow-sm">
                <div className="text-4xl mb-4">👋</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">This is your profile!</h3>
                <p className="text-sm text-gray-500 font-medium">You cannot book your own services.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                <div>
                  <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1.5">Contact Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-500">
                      <Phone size={18} />
                    </div>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handlePhoneChange}
                      required
                      placeholder="e.g. 9876543210"
                      maxLength="15"
                      className="w-full pl-11 pr-4 py-3 bg-white/50 focus:bg-white text-sm md:text-base font-semibold text-gray-900 border border-white/60 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1.5">Service Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-500">
                      <MapPin size={18} />
                    </div>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      onBlur={() => handleBlur("address")}
                      required
                      placeholder="House No, Street, City"
                      className="w-full pl-11 pr-4 py-3 bg-white/50 focus:bg-white text-sm md:text-base font-semibold text-gray-900 border border-white/60 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1.5">Preferred Date</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-500 z-10">
                      <CalendarIcon size={18} />
                    </div>
                    <input
                      type="date"
                      name="scheduledDate"
                      value={formData.scheduledDate}
                      onChange={handleChange}
                      required
                      min={getLocalTodayString()}
                      className="w-full pl-11 pr-4 py-3 bg-white/50 focus:bg-white text-sm md:text-base font-semibold text-gray-900 border border-white/60 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1.5">Notes (Optional)</label>
                  <div className="relative">
                    <div className="absolute top-4 left-4 pointer-events-none text-blue-500">
                      <FileText size={18} />
                    </div>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      onBlur={() => handleBlur("notes")}
                      rows="3"
                      placeholder="Describe the issue you need help with..."
                      className="w-full pl-11 pr-4 py-3 bg-white/50 focus:bg-white text-sm md:text-base font-semibold text-gray-900 border border-white/60 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all shadow-sm"
                    ></textarea>
                  </div>
                </div>

                <div className="bg-blue-500/5 border border-blue-500/20 backdrop-blur-sm rounded-2xl p-5 mb-6 mt-4">
                  <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                    <h4 className="text-xs md:text-sm font-extrabold text-blue-900 uppercase tracking-wider">
                      Booking Summary
                    </h4>
                    
                    {!fairPriceData && (
                      <button 
                        type="button"
                        onClick={handleCheckFairPrice}
                        disabled={isCheckingPrice}
                        className="text-[10px] md:text-xs font-bold text-emerald-700 bg-white border border-emerald-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-emerald-50 transition-colors shadow-sm disabled:opacity-50"
                      >
                        <TrendingUp size={14} className={isCheckingPrice ? "animate-bounce text-emerald-500" : "text-emerald-500"} />
                        {isCheckingPrice ? "Analyzing..." : "Check Fair Price"}
                      </button>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-sm text-gray-700 font-medium mb-2.5">
                    <span>Base Visiting Fee</span>
                    <span className="font-bold text-gray-900">₹{BASE_PRICE}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-700 font-medium mb-3.5 pb-3.5 border-b border-blue-200/50">
                    <span>Platform Fee</span>
                    <span className="text-emerald-600 font-bold bg-white px-2.5 py-0.5 rounded-md border border-emerald-100 shadow-sm">Free</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-gray-900 text-base">Total Estimate</span>
                    <span className="font-extrabold text-blue-600 text-xl">₹{BASE_PRICE}</span>
                  </div>

                  {fairPriceData && (
                    <div className="mt-5 p-4 bg-white rounded-xl border border-emerald-100 shadow-[0_4px_12px_rgb(0,0,0,0.03)] animate-fade-in-up">
                      <p className="text-sm text-gray-800 font-bold leading-relaxed mb-3">
                        <Sparkles className="inline-block text-emerald-500 mb-0.5 mr-1.5" size={16} />
                        {fairPriceData.estimate}
                      </p>
                      
                      {fairPriceData.sources && fairPriceData.sources.length > 0 && (
                        <div className="pt-3 border-t border-gray-100">
                          <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <Globe size={12} /> Sources Verified by AI
                          </p>
                          <ul className="space-y-1.5">
                            {fairPriceData.sources.slice(0, 2).map((source, i) => (
                              <li key={i} className="text-xs font-bold text-blue-600 hover:text-blue-700 truncate transition-colors">
                                <a href={source.url} target="_blank" rel="noreferrer" className="hover:underline">
                                  {source.title || new URL(source.url).hostname}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  <p className="text-xs font-semibold text-gray-500 mt-5 flex items-start gap-2 leading-relaxed">
                    <ShieldCheck size={16} className="shrink-0 text-blue-500" />
                    You will pay the provider directly after the job is completed to your satisfaction.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={booking}
                  className="w-full bg-gray-900 text-white text-base font-bold py-4 rounded-xl hover:bg-gray-800 transition-all disabled:opacity-70 shadow-lg hover:shadow-xl active:scale-[0.98]"
                >
                  {booking ? "Submitting Request..." : `Confirm Booking • ₹${BASE_PRICE}`}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {(!user || user.id !== provider.user_id) && (
        <div className="fixed bottom-[72px] left-0 right-0 p-3 bg-white/80 backdrop-blur-xl border-t border-white/50 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] z-40 md:hidden animate-fade-in-up">
          <div className="flex items-center justify-between px-2">
            <div>
              <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">Base Fee</p>
              <p className="text-xl font-extrabold text-gray-900 leading-tight">₹{BASE_PRICE}</p>
            </div>
            <button 
              onClick={scrollToForm}
              className="bg-gray-900 text-white px-7 py-3 rounded-xl text-sm font-bold shadow-lg hover:bg-gray-800 active:scale-95 transition-all"
            >
              Book Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}