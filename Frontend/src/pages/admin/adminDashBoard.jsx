import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { createPortal } from "react-dom"; // 🌟 NEW: Import createPortal
import useDebounce from "../../hooks/debounceHook";
import usePagination from "../../hooks/usePagination";
import { fetchAllUsers, fetchAllBookings, toggleUserStatus } from "../../redux/slices/adminSlice";
import { useToast } from "../../hooks/toastHook";
import LoadingSpinner from "../../components/common/loadingSpinner";
import { 
  Users, 
  Image as ImageIcon, 
  Search, 
  ShieldAlert, 
  Camera,
  X,
  CheckCircle,
  Clock,
  Activity,
  UserCircle
} from "lucide-react";

// Chart.js Imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { showSuccess, showError, showLoading, dismissToast } = useToast();

  const { user } = useSelector((state) => state.auth);
  
  const {
    users = [],
    allBookings = [],
    isLoading,
  } = useSelector((state) => state.admin);

  const [activeTab, setActiveTab] = useState("users");
  const [searchTerm, setSearchTerm] = useState("");
  const [auditModal, setAuditModal] = useState(null);

  // 🌟 NEW: Lock body scroll when modal is open so background doesn't move
  useEffect(() => {
    if (auditModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    // Cleanup function
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [auditModal]);

  useEffect(() => {
    if (users.length === 0) dispatch(fetchAllUsers());
    if (allBookings.length === 0) dispatch(fetchAllBookings());
  }, [dispatch, users.length, allBookings.length]);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const filteredUsers = users.filter((user) => {
    const term = debouncedSearchTerm.toLowerCase();
    return (
      (user.name && user.name.toLowerCase().includes(term)) ||
      (user.email && user.email.toLowerCase().includes(term)) ||
      (user.role && user.role.toLowerCase().includes(term))
    );
  });

  const {
    next: nextUser,
    prev: prevUser,
    jump: jumpUser,
    currentData: currentUsers,
    currentPage: userPage,
    maxPage: maxUserPage,
  } = usePagination(filteredUsers, 5);

  const {
    next: nextBooking,
    prev: prevBooking,
    currentData: currentBookings,
    currentPage: bookingPage,
    maxPage: maxBookingPage,
  } = usePagination(allBookings, 6);

  useEffect(() => {
    jumpUser(1);
  }, [debouncedSearchTerm]);

  const handleSuspendToggle = async (userId, currentStatus) => {
    const loadingId = showLoading(currentStatus ? "Reactivating user..." : "Suspending user...");
    
    const res = await dispatch(toggleUserStatus({ userId, isSuspended: !currentStatus }));
    
    dismissToast(loadingId);

    if (res.meta.requestStatus === "fulfilled") {
      showSuccess(res.payload.message || "User status updated.");
    } else {
      showError(res.payload || "Failed to update user status.");
    }
  };

  const totalActiveUsers = users.filter(u => !u.is_suspended && u.role !== 'admin').length;
  const totalSuspended = users.filter(u => u.is_suspended).length;
  const completedJobsCount = allBookings.filter(b => b.status === "Completed").length;

  const customerCount = users.filter(u => u.role === 'customer').length || 1;
  const providerCount = users.filter(u => u.role === 'provider').length || 1;
  const adminCount = users.filter(u => u.role === 'admin').length || 1;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // --- CHART CONFIGURATIONS ---
  const lineChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Platform Activity',
        data: [12, 19, 15, 25, 22, 30, 28], 
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#3b82f6',
        pointBorderWidth: 2,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: 'rgba(17, 24, 39, 0.9)', padding: 12, borderRadius: 8 },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: 'Inter', weight: '600' } } },
      y: { border: { display: false }, grid: { color: 'rgba(0,0,0,0.05)' } },
    }
  };

  const doughnutData = {
    labels: ['Customers', 'Providers', 'Admins'],
    datasets: [
      {
        data: [customerCount, providerCount, adminCount],
        backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981'],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: {
      legend: { position: 'bottom', labels: { font: { family: 'Inter', weight: 'bold' }, padding: 15 } },
    }
  };

  return (
    <div className="relative min-h-screen scale-[0.85] md:scale-100 md:mt-0 -mt-20">
      {/* Background Orbs for Glassmorphism */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-5%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] bg-purple-400/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-28 space-y-8 pb-24 md:pb-12 relative z-10">
        
        {/* 1. Dashboard Header & Greeting */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white/60 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60">
          <div>
            <p className="text-xs md:text-sm font-extrabold text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Clock size={16} /> {today}
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Good morning, {user?.name?.split(' ')[0] || "Admin"}!
            </h1>
            <p className="text-gray-600 mt-2 text-lg font-medium">
              Here is what's happening on your platform today.
            </p>
          </div>
        </div>

        {/* 2. CHARTS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Line Chart */}
          <div className="lg:col-span-2 bg-white/60 backdrop-blur-xl rounded-[2rem] shadow-sm border border-white/60 p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Activity size={20} className="text-blue-500"/> Platform Activity
              </h2>
              <span className="text-[10px] md:text-xs font-extrabold text-blue-700 bg-blue-100/50 border border-blue-200 px-3 py-1 rounded-full uppercase tracking-wider">This Week</span>
            </div>
            <div className="h-[200px] md:h-[250px] w-full">
              <Line data={lineChartData} options={lineChartOptions} />
            </div>
          </div>

          {/* Doughnut Chart */}
          <div className="lg:col-span-1 bg-white/60 backdrop-blur-xl rounded-[2rem] shadow-sm border border-white/60 p-6 md:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <UserCircle size={20} className="text-purple-500"/> User Demographics
            </h2>
            <div className="h-[200px] md:h-[250px] w-full relative mt-4">
              <Doughnut data={doughnutData} options={doughnutOptions} />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none mt-[-30px]">
                <div className="text-center">
                  <span className="block text-2xl md:text-3xl font-extrabold text-gray-900">{users.length}</span>
                  <span className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">Total</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Top Analytics Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/60 backdrop-blur-xl p-6 rounded-[2rem] shadow-sm border border-white/60 flex items-center gap-5 hover:bg-white/80 transition-all">
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 text-blue-600 rounded-2xl shadow-sm">
              <Users size={28} />
            </div>
            <div>
              <p className="text-[10px] md:text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">Active Users</p>
              <p className="text-3xl font-extrabold text-gray-900">{totalActiveUsers}</p>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-xl p-6 rounded-[2rem] shadow-sm border border-white/60 flex items-center gap-5 hover:bg-white/80 transition-all">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-2xl shadow-sm">
              <CheckCircle size={28} />
            </div>
            <div>
              <p className="text-[10px] md:text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">Completed Jobs</p>
              <p className="text-3xl font-extrabold text-gray-900">{completedJobsCount}</p>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-xl p-6 rounded-[2rem] shadow-sm border border-white/60 flex items-center gap-5 hover:bg-white/80 transition-all">
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-2xl shadow-sm">
              <ShieldAlert size={28} />
            </div>
            <div>
              <p className="text-[10px] md:text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">Suspended</p>
              <p className="text-3xl font-extrabold text-gray-900">{totalSuspended}</p>
            </div>
          </div>
        </div>

        {/* 4. Modern Pill Tabs */}
        <div className="flex space-x-2 bg-white/40 backdrop-blur-md p-1.5 rounded-2xl w-fit overflow-x-auto border border-white/60 shadow-sm">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-2.5 font-bold text-sm rounded-xl transition-all flex items-center gap-2 ${
              activeTab === "users"
                ? "bg-white text-blue-600 shadow-md"
                : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
            }`}
          >
            <Users size={18} /> Manage Users
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`px-6 py-2.5 font-bold text-sm rounded-xl transition-all flex items-center gap-2 ${
              activeTab === "bookings"
                ? "bg-white text-blue-600 shadow-md"
                : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
            }`}
          >
            <ImageIcon size={18} /> Job Audits
          </button>
        </div>

        {isLoading ? (
          <div className="py-20">
            <LoadingSpinner fullScreen={false} message="Loading Admin Data..." />
          </div>
        ) : (
          <>
            {/* ========================================== */}
            {/* USERS TAB                                  */}
            {/* ========================================== */}
            {activeTab === "users" && (
              <div className="space-y-6 animate-fade-in-up">
                <div className="relative max-w-md">
                  <input
                    type="text"
                    placeholder="Search by name, email, or role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl focus:bg-white font-medium text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                </div>

                <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 overflow-hidden">
                  <div className="hidden md:grid grid-cols-5 bg-white/40 border-b border-gray-200/50 px-6 py-5 text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">
                    <div>ID</div>
                    <div>Name</div>
                    <div>Email</div>
                    <div>Role</div>
                    <div className="text-right">Action</div>
                  </div>

                  <div className="divide-y divide-gray-200/50">
                    {currentUsers().length > 0 ? (
                      currentUsers().map((u) => (
                        <div key={u.id} className="flex flex-col md:grid md:grid-cols-5 md:items-center px-6 py-6 hover:bg-white/80 gap-3 transition-colors">
                          <div className="text-xs font-bold text-gray-400 hidden md:block">#{u.id}</div>
                          <div className="flex justify-between items-start md:block">
                            <div className="font-extrabold text-gray-900 text-lg md:text-base">
                              {u.name} {u.is_suspended ? <span className="text-red-600 ml-2 text-[10px] bg-red-100/50 border border-red-200 px-2 py-0.5 rounded-full uppercase tracking-wider">Suspended</span> : null}
                            </div>
                            <div className="text-[10px] font-bold text-gray-400 md:hidden uppercase tracking-widest">ID #{u.id}</div>
                          </div>
                          <div className="text-sm font-medium text-gray-600 truncate">{u.email}</div>
                          <div>
                            <span className={`inline-block px-3 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-widest border ${
                              u.role === "provider" ? "bg-purple-50 text-purple-700 border-purple-200" :
                              u.role === "admin" ? "bg-gray-900 text-white border-gray-900" :
                              "bg-blue-50 text-blue-700 border-blue-200"
                            }`}>
                              {u.role}
                            </span>
                          </div>
                          <div className="mt-2 md:mt-0 md:text-right">
                            <button 
                              onClick={() => handleSuspendToggle(u.id, u.is_suspended)}
                              disabled={u.role === 'admin'}
                              className={`flex items-center justify-center md:justify-end gap-1.5 px-4 py-2.5 md:px-0 md:py-0 w-full md:w-auto rounded-xl text-sm font-bold transition-all shadow-sm md:shadow-none ml-auto disabled:opacity-30 disabled:cursor-not-allowed ${
                                u.is_suspended 
                                  ? "text-emerald-600 bg-white border border-emerald-200 md:border-transparent md:bg-transparent hover:text-emerald-800 hover:bg-emerald-50 md:hover:bg-transparent active:scale-95" 
                                  : "text-red-600 bg-white border border-red-200 md:border-transparent md:bg-transparent hover:text-red-800 hover:bg-red-50 md:hover:bg-transparent active:scale-95"
                              }`}
                            >
                              <ShieldAlert size={16} /> 
                              {u.is_suspended ? "Activate" : "Suspend"}
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-6 py-16 text-center text-gray-500 font-medium">
                        No users match your search.
                      </div>
                    )}
                  </div>

                  {maxUserPage > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-5 bg-white/40 border-t border-gray-200/50 gap-4">
                      <span className="text-sm text-gray-600 font-medium">
                        Page <span className="font-extrabold text-gray-900">{userPage}</span> of <span className="font-extrabold text-gray-900">{maxUserPage}</span>
                      </span>
                      <div className="flex space-x-3 w-full sm:w-auto">
                        <button onClick={prevUser} disabled={userPage === 1} className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:shadow-md disabled:opacity-40 transition-all shadow-sm active:scale-95">Previous</button>
                        <button onClick={nextUser} disabled={userPage === maxUserPage} className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:shadow-md disabled:opacity-40 transition-all shadow-sm active:scale-95">Next</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ========================================== */}
            {/* JOB AUDITS TAB                               */}
            {/* ========================================== */}
            {activeTab === "bookings" && (
              <div className="space-y-6 animate-fade-in-up z-1000">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentBookings().length === 0 ? (
                    <div className="col-span-full py-20 text-center flex flex-col items-center bg-white/60 backdrop-blur-xl rounded-[2rem] border border-dashed border-gray-300">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                        <Camera className="w-8 h-8 text-gray-300" />
                      </div>
                      <p className="text-gray-900 font-bold text-lg">No completed jobs found on the platform yet.</p>
                    </div>
                  ) : (
                    currentBookings().map((booking) => (
                      <div key={booking.id} className="bg-white/60 backdrop-blur-xl rounded-[2rem] shadow-sm border border-white/60 p-6 flex flex-col justify-between hover:bg-white/80 transition-all hover:-translate-y-1 z-50">
                        <div>
                          <div className="flex justify-between items-start mb-4 gap-2">
                            <h3 className="font-extrabold text-gray-900 text-xl">Job #{booking.id}</h3>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                              booking.status === "Completed" ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm" : "bg-gray-50 text-gray-700 border-gray-200"
                            }`}>
                              {booking.status}
                            </span>
                          </div>
                          <div className="space-y-2.5">
                            <p className="text-sm text-gray-600 flex justify-between border-b border-gray-200/50 pb-2.5"><span className="font-bold text-gray-800">Customer:</span> {booking.customer_name || `User #${booking.customer_id}`}</p>
                            <p className="text-sm text-gray-600 flex justify-between"><span className="font-bold text-gray-800">Provider:</span> {booking.provider_name || `Provider #${booking.provider_id}`}</p>
                          </div>
                          <div className="mt-5 pt-4 border-t border-gray-200/50 bg-white/40 p-4 rounded-xl shadow-inner">
                            <p className="text-sm text-gray-500 line-clamp-2 italic font-medium">"{booking.notes || "No notes provided."}"</p>
                          </div>
                        </div>

                        {booking.status === "Completed" && (
                          <button onClick={() => setAuditModal(booking)} className="mt-6 w-full flex items-center justify-center gap-2 bg-gray-900 text-white text-sm font-bold py-3.5 rounded-xl hover:bg-gray-800 transition-all shadow-md active:scale-95 hover:shadow-lg">
                            <ImageIcon size={16} /> View Evidence
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {maxBookingPage > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-5 bg-white/60 backdrop-blur-xl rounded-[2rem] shadow-sm border border-white/60 gap-4">
                    <span className="text-sm text-gray-600 font-medium">
                      Page <span className="font-extrabold text-gray-900">{bookingPage}</span> of <span className="font-extrabold text-gray-900">{maxBookingPage}</span>
                    </span>
                    <div className="flex space-x-3 w-full sm:w-auto">
                      <button onClick={prevBooking} disabled={bookingPage === 1} className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:shadow-md disabled:opacity-40 transition-all shadow-sm active:scale-95">Previous</button>
                      <button onClick={nextBooking} disabled={bookingPage === maxBookingPage} className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:shadow-md disabled:opacity-40 transition-all shadow-sm active:scale-95">Next</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* 🌟 NEW: Audit Modal wrapper with createPortal for completely escaping DOM hierarchies and z-index clashes */}
      {auditModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 transition-all" onClick={() => setAuditModal(null)}>
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-4xl w-full p-6 md:p-10 relative overflow-hidden animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
            
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100 shadow-sm">
                  <Camera className="text-blue-600 w-6 h-6" /> 
                </div>
                Job #{auditModal.id} Audit
              </h3>
              <button onClick={() => setAuditModal(null)} className="text-gray-400 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-red-500 shadow-sm"></span>
                  <h4 className="font-extrabold text-gray-800 uppercase tracking-widest text-sm">Before Service</h4>
                </div>
                <div className="bg-gray-50 rounded-[1.5rem] h-56 md:h-80 border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center group relative shadow-inner">
                  {auditModal.before_image_url || auditModal.beforeImage ? (
                    <img src={auditModal.before_image_url || auditModal.beforeImage} alt="Before" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <span className="text-gray-400 font-bold text-sm flex flex-col items-center gap-3"><ImageIcon size={28}/> No image uploaded</span>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-sm"></span>
                  <h4 className="font-extrabold text-gray-800 uppercase tracking-widest text-sm">After Service</h4>
                </div>
                <div className="bg-gray-50 rounded-[1.5rem] h-56 md:h-80 border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center group relative shadow-inner">
                  {auditModal.after_image_url || auditModal.afterImage ? (
                    <img src={auditModal.after_image_url || auditModal.afterImage} alt="After" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <span className="text-gray-400 font-bold text-sm flex flex-col items-center gap-3"><ImageIcon size={28}/> No image uploaded</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}