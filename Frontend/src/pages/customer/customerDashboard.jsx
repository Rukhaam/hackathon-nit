import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { fetchMyBookings } from "../../redux/slices/bookingSlice";
import LoadingSpinner from "../../components/common/loadingSpinner";
import {
  Activity,
  CheckCircle,
  CalendarDays,
  MapPin,
  CalendarClock,
  ArrowRight,
} from "lucide-react";

export default function CustomerDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const {
    items: bookings,
    isLoading,
    error,
  } = useSelector((state) => state.bookings);

  useEffect(() => {
    dispatch(fetchMyBookings());
  }, [dispatch]);

  const activeBookings = bookings.filter((b) =>
    ["Requested", "Confirmed", "In-progress"].includes(b.status)
  );
  const completedBookings = bookings.filter((b) => b.status === "Completed");

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

  const safeGetTime = (dateStr) => {
    if (!dateStr) return 0;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 0 : d.getTime();
  };

  // Grab the 5 most recent bookings for the feed
  const recentBookings = [...bookings]
    .sort(
      (a, b) =>
        safeGetTime(b.scheduledDate || b.scheduled_date) -
        safeGetTime(a.scheduledDate || a.scheduled_date)
    )
    .slice(0, 5);

  if (isLoading) {
    return (
      <LoadingSpinner fullScreen={false} message="Loading your dashboard..." />
    );
  }

  return (
    // 🌟 Removed mt-20 to fix the massive layout shift!
    <div className="max-w-6xl mx-auto space-y-8 mt-4 pb-12">
      {/* ========================================== */}
      {/* HEADER                                     */}
      {/* ========================================== */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Hello, {user?.name}! 👋
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            Welcome back. Here is an overview of your services.
          </p>
        </div>
        <Link
          to="/"
          className="flex items-center justify-center gap-2 bg-gray-900 text-white font-semibold px-6 py-3 rounded-xl hover:bg-gray-800 transition-all shadow-md hover:shadow-lg"
        >
          Book a New Service
          <ArrowRight size={18} />
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-200 shadow-sm">
          {error}
        </div>
      )}

      {/* ========================================== */}
      {/* STATS CARDS                                */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Requests Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between group hover:border-blue-200 transition-colors">
          <div>
            <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
              Active Requests
            </div>
            <div className="text-4xl font-extrabold text-gray-900">
              {activeBookings.length}
            </div>
          </div>
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
            <Activity size={28} />
          </div>
        </div>

        {/* Completed Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between group hover:border-green-200 transition-colors">
          <div>
            <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
              Services Completed
            </div>
            <div className="text-4xl font-extrabold text-gray-900">
              {completedBookings.length}
            </div>
          </div>
          <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
            <CheckCircle size={28} />
          </div>
        </div>

        {/* Total Bookings Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between group hover:border-gray-300 transition-colors">
          <div>
            <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
              Total Bookings
            </div>
            <div className="text-4xl font-extrabold text-gray-900">
              {bookings.length}
            </div>
          </div>
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-600 group-hover:scale-110 transition-transform">
            <CalendarDays size={28} />
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* RECENT BOOKINGS FEED                       */}
      {/* ========================================== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-extrabold text-gray-900">
            Recent Activity
          </h2>
          <Link
            to="/customer/bookings"
            className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
          >
            View all history <ArrowRight size={14} />
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center bg-gray-50/30">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <CalendarDays className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              No bookings yet
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm">
              You haven't requested any services. Ready to find an expert and
              get started?
            </p>
            <Link
              to="/"
              className="bg-white border border-gray-200 text-gray-700 font-bold px-6 py-2.5 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            >
              Browse professionals
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {recentBookings.map((booking) => (
              <li
                key={booking.id}
                className="p-6 hover:bg-gray-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-6 group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-bold text-gray-900">
                      Booking #{booking.id}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
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

                  {/* 🌟 Upgraded Text with Icons */}
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <CalendarClock size={16} className="text-gray-400" />
                      <span className="font-semibold text-gray-700">
                        Scheduled:
                      </span>{" "}
                      {formatDate(
                        booking.scheduledDate || booking.scheduled_date
                      )}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-2 line-clamp-1">
                      <MapPin size={16} className="text-gray-400" />
                      <span className="font-semibold text-gray-700">
                        Address:
                      </span>{" "}
                      {booking.address}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  <Link
                    to="/customer/bookings"
                    className="text-sm bg-white border border-gray-200 text-gray-700 font-bold py-2.5 px-5 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm group-hover:shadow flex items-center gap-2"
                  >
                    Manage
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
