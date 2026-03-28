import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { fetchMyBookings } from "../../redux/slices/bookingSlice";
import LoadingSpinner from "../../components/common/loadingSpinner";
import { 
  Briefcase, 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  CalendarDays,
  CalendarClock,
  IndianRupee // Assuming INR, use DollarSign if USD
} from "lucide-react";

export default function ProviderDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items: bookings, isLoading, error } = useSelector((state) => state.bookings);

  useEffect(() => {
    dispatch(fetchMyBookings());
  }, [dispatch]);

  // 🌟 Calculate Job Stats
  const pendingRequests = bookings.filter(b => b.status === "Requested").length;
  const activeJobs = bookings.filter(b => ["Confirmed", "In-progress"].includes(b.status)).length;
  const completedJobs = bookings.filter(b => b.status === "Completed").length;

  // 🌟 Calculate Total Earnings (Sum of 'price' for all 'Completed' jobs)
  const totalEarnings = bookings
    .filter(b => b.status === "Completed")
    .reduce((sum, booking) => {
      // Ensure we parse the price as a float in case it's stored as a string
      const price = parseFloat(booking.price) || 0;
      return sum + price;
    }, 0);

  // Helper function to safely format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const safeGetTime = (dateStr) => {
    if (!dateStr) return 0;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 0 : d.getTime();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No Date Set";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Date Pending"; 
    
    return date.toLocaleDateString("en-US", {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const recentBookings = [...bookings]
    .sort((a, b) => safeGetTime(b.scheduledDate || b.scheduled_date) - safeGetTime(a.scheduledDate || a.scheduled_date))
    .slice(0, 5);

  if (isLoading) {
    return <LoadingSpinner fullScreen={false} message="Loading your dashboard..." />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 mt-4 pb-12">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            Here is what is happening with your service business today.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-200 shadow-sm">
          {error}
        </div>
      )}

      {/* 🌟 STATS CARDS (Now an even 4-column grid on desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* New Earnings Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between group hover:border-emerald-200 transition-colors">
          <div>
            <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Total Earnings</div>
            <div className="text-3xl font-extrabold text-gray-900">{formatCurrency(totalEarnings)}</div>
          </div>
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
            <IndianRupee size={28} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between group hover:border-blue-200 transition-colors">
          <div>
            <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Pending Requests</div>
            <div className="text-3xl font-extrabold text-gray-900">{pendingRequests}</div>
          </div>
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
            <Clock size={28} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between group hover:border-amber-200 transition-colors">
          <div>
            <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Active Jobs</div>
            <div className="text-3xl font-extrabold text-gray-900">{activeJobs}</div>
          </div>
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
            <Briefcase size={28} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between group hover:border-green-200 transition-colors">
          <div>
            <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Completed Jobs</div>
            <div className="text-3xl font-extrabold text-gray-900">{completedJobs}</div>
          </div>
          <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
            <CheckCircle size={28} />
          </div>
        </div>
      </div>

      {/* RECENT BOOKINGS FEED */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-extrabold text-gray-900">Recent Activity</h2>
          <Link to="/provider/jobs" className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1">
            View all jobs <ArrowRight size={14} />
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center bg-gray-50/30">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <CalendarDays className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No booking requests yet</h3>
            <p className="text-gray-500 mb-6 max-w-sm">Make sure your Duty Status is turned on in your profile so customers can find you!</p>
            <Link to="/provider/profile" className="bg-white border border-gray-200 text-gray-700 font-bold px-6 py-2.5 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
              Check Duty Status
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {recentBookings.map((booking) => (
              <li key={booking.id} className="p-6 hover:bg-gray-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-lg font-bold text-gray-900">Booking #{booking.id}</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                      booking.status === 'Requested' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      booking.status === 'Confirmed' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      booking.status === 'In-progress' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                      booking.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <CalendarClock size={16} className="text-gray-400" />
                    <span className="font-semibold text-gray-700">Scheduled:</span> {formatDate(booking.scheduledDate || booking.scheduled_date)}
                  </p>
                </div>
                <div className="shrink-0">
                  <Link to="/provider/jobs" className="text-sm bg-white border border-gray-200 text-gray-700 font-bold py-2.5 px-5 rounded-xl hover:bg-gray-50 transition-all shadow-sm group-hover:shadow flex items-center gap-2">
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