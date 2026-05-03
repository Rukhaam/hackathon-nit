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
  IndianRupee 
} from "lucide-react";

export default function ProviderDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items: bookings, isLoading, error } = useSelector((state) => state.bookings);

  useEffect(() => {
    dispatch(fetchMyBookings());
  }, [dispatch]);

  const pendingRequests = bookings.filter(b => b.status === "Requested").length;
  const activeJobs = bookings.filter(b => ["Confirmed", "In-progress"].includes(b.status)).length;
  const completedJobs = bookings.filter(b => b.status === "Completed").length;

  const totalEarnings = bookings
    .filter(b => b.status === "Completed")
    .reduce((sum, booking) => {
      const price = parseFloat(booking.price) || 0;
      return sum + price;
    }, 0);

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
    <div className="relative min-h-screen">
      {/* Glassmorphic Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-5%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] bg-emerald-400/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 pt-24 md:pt-28 px-4 sm:px-6 pb-24 md:pb-12 relative z-10">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 bg-white/60 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] shadow-sm border border-white/60">
          <div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-gray-600 mt-2 text-sm md:text-lg font-medium">
              Here is what is happening with your service business today.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50/80 backdrop-blur-md text-red-600 p-4 rounded-xl text-sm font-bold border border-red-200 shadow-sm animate-fade-in-up">
            {error}
          </div>
        )}

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white/60 backdrop-blur-xl rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-white/60 p-5 md:p-6 flex items-center justify-between group hover:bg-white/80 transition-all">
            <div>
              <div className="text-[10px] md:text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1.5">Total Earnings</div>
              <div className="text-2xl md:text-3xl font-black text-gray-900">{formatCurrency(totalEarnings)}</div>
            </div>
            <div className="w-12 h-12 md:w-14 md:h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-500/20 group-hover:scale-110 transition-transform shadow-sm">
              <IndianRupee size={24} className="md:w-[28px] md:h-[28px]" />
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-xl rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-white/60 p-5 md:p-6 flex items-center justify-between group hover:bg-white/80 transition-all">
            <div>
              <div className="text-[10px] md:text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1.5">Pending Requests</div>
              <div className="text-2xl md:text-3xl font-black text-gray-900">{pendingRequests}</div>
            </div>
            <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-500/20 group-hover:scale-110 transition-transform shadow-sm">
              <Clock size={24} className="md:w-[28px] md:h-[28px]" />
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-xl rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-white/60 p-5 md:p-6 flex items-center justify-between group hover:bg-white/80 transition-all">
            <div>
              <div className="text-[10px] md:text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1.5">Active Jobs</div>
              <div className="text-2xl md:text-3xl font-black text-gray-900">{activeJobs}</div>
            </div>
            <div className="w-12 h-12 md:w-14 md:h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600 border border-amber-500/20 group-hover:scale-110 transition-transform shadow-sm">
              <Briefcase size={24} className="md:w-[28px] md:h-[28px]" />
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-xl rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-white/60 p-5 md:p-6 flex items-center justify-between group hover:bg-white/80 transition-all">
            <div>
              <div className="text-[10px] md:text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1.5">Completed Jobs</div>
              <div className="text-2xl md:text-3xl font-black text-gray-900">{completedJobs}</div>
            </div>
            <div className="w-12 h-12 md:w-14 md:h-14 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-600 border border-green-500/20 group-hover:scale-110 transition-transform shadow-sm">
              <CheckCircle size={24} className="md:w-[28px] md:h-[28px]" />
            </div>
          </div>
        </div>

        {/* RECENT BOOKINGS FEED */}
        <div className="bg-white/60 backdrop-blur-xl rounded-[1.5rem] md:rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 overflow-hidden">
          <div className="px-5 md:px-6 py-4 md:py-5 border-b border-white/60 flex justify-between items-center bg-white/40">
            <h2 className="text-base md:text-lg font-extrabold text-gray-900">Recent Activity</h2>
            <Link to="/provider/jobs" className="text-xs md:text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {recentBookings.length === 0 ? (
            <div className="p-10 md:p-16 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                <CalendarDays className="w-8 h-8 md:w-10 md:h-10 text-gray-300" />
              </div>
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1.5">No booking requests yet</h3>
              <p className="text-xs md:text-sm text-gray-500 mb-6 max-w-sm font-medium">Make sure your Duty Status is turned on in your profile so customers can find you!</p>
              <Link to="/provider/profile" className="bg-gray-900 text-white font-bold px-6 py-3 rounded-xl hover:bg-gray-800 transition-all shadow-md text-xs md:text-sm">
                Check Duty Status
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200/50">
              {recentBookings.map((booking) => (
                <li key={booking.id} className="p-5 md:p-6 hover:bg-white/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                  <div>
                    <div className="flex items-center gap-2.5 mb-2">
                      <p className="text-base md:text-lg font-extrabold text-gray-900">Booking #{booking.id}</p>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                        booking.status === 'Requested' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        booking.status === 'Confirmed' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        booking.status === 'In-progress' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        booking.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' :
                        'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-xs md:text-sm text-gray-600 flex items-center gap-1.5 font-medium">
                      <CalendarClock size={14} className="text-gray-400" />
                      <span className="font-bold text-gray-800">Scheduled:</span> {formatDate(booking.scheduledDate || booking.scheduled_date)}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <Link to="/provider/jobs" className="w-full sm:w-auto text-xs md:text-sm bg-white border border-gray-200 text-gray-700 font-bold py-2.5 md:py-3 px-6 rounded-xl hover:bg-gray-50 transition-all shadow-sm group-hover:shadow flex items-center justify-center gap-2 active:scale-95">
                      Manage Job
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}