import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
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
  TrendingUp,
  CheckCircle,
  Clock
} from "lucide-react";

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

  // 🌟 Quick stats calculations for the top cards
  const totalActiveUsers = users.filter(u => !u.is_suspended && u.role !== 'admin').length;
  const totalSuspended = users.filter(u => u.is_suspended).length;
  const completedJobsCount = allBookings.filter(b => b.status === "Completed").length;

  // Formatting today's date dynamically
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-12 bg-gray-50/50 min-h-screen">
      
      {/* 🌟 1. Dashboard Header & Greeting */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
        <div>
          <p className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-1 flex items-center gap-2">
            <Clock size={16} /> {today}
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            Good morning, {user?.name?.split(' ')[0] || "Admin"}!
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            Here is what's happening on your platform today.
          </p>
        </div>
      </div>

      {/* 🌟 2. Top Analytics Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
            <Users size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Active Users</p>
            <p className="text-3xl font-extrabold text-gray-900">{totalActiveUsers}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-4 bg-green-50 text-green-600 rounded-2xl">
            <CheckCircle size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Completed Jobs</p>
            <p className="text-3xl font-extrabold text-gray-900">{completedJobsCount}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-4 bg-red-50 text-red-600 rounded-2xl">
            <ShieldAlert size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Suspended Accounts</p>
            <p className="text-3xl font-extrabold text-gray-900">{totalSuspended}</p>
          </div>
        </div>
      </div>

      {/* 🌟 3. Modern Pill Tabs */}
      <div className="flex space-x-2 bg-gray-200/50 p-1.5 rounded-2xl w-fit overflow-x-auto">
        <button
          onClick={() => setActiveTab("users")}
          className={`px-6 py-2.5 font-bold text-sm rounded-xl transition-all flex items-center gap-2 ${
            activeTab === "users"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-500 hover:text-gray-800 hover:bg-gray-200/50"
          }`}
        >
          <Users size={18} /> Manage Users
        </button>
        <button
          onClick={() => setActiveTab("bookings")}
          className={`px-6 py-2.5 font-bold text-sm rounded-xl transition-all flex items-center gap-2 ${
            activeTab === "bookings"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-500 hover:text-gray-800 hover:bg-gray-200/50"
          }`}
        >
          <ImageIcon size={18} /> Job Audits
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner fullScreen={false} message="Loading Admin Data..." />
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
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="hidden md:grid grid-cols-5 bg-gray-50/80 border-b border-gray-100 px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <div>ID</div>
                  <div>Name</div>
                  <div>Email</div>
                  <div>Role</div>
                  <div className="text-right">Action</div>
                </div>

                <div className="divide-y divide-gray-100">
                  {currentUsers().length > 0 ? (
                    currentUsers().map((u) => (
                      <div key={u.id} className="flex flex-col md:grid md:grid-cols-5 md:items-center px-6 py-5 hover:bg-gray-50 gap-3 transition-colors">
                        <div className="text-sm font-mono text-gray-400 hidden md:block">#{u.id}</div>
                        <div className="flex justify-between items-start md:block">
                          <div className="font-bold text-gray-900">
                            {u.name} {u.is_suspended ? <span className="text-red-500 ml-1 text-[10px] bg-red-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Suspended</span> : null}
                          </div>
                          <div className="text-xs font-mono text-gray-400 md:hidden">#{u.id}</div>
                        </div>
                        <div className="text-sm text-gray-600 truncate">{u.email}</div>
                        <div>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
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
                            className={`flex items-center justify-center md:justify-end gap-1.5 px-4 py-2 md:px-0 md:py-0 w-full md:w-auto rounded-lg text-sm font-bold transition-colors ml-auto disabled:opacity-30 disabled:cursor-not-allowed ${
                              u.is_suspended 
                                ? "text-green-600 bg-green-50 md:bg-transparent hover:text-green-800 hover:bg-green-100 md:hover:bg-transparent" 
                                : "text-red-600 bg-red-50 md:bg-transparent hover:text-red-800 hover:bg-red-100 md:hover:bg-transparent"
                            }`}
                          >
                            <ShieldAlert size={16} /> 
                            {u.is_suspended ? "Activate" : "Suspend"}
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-12 text-center text-gray-500 bg-gray-50/50">
                      No users match your search.
                    </div>
                  )}
                </div>

                {maxUserPage > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-gray-50/80 border-t border-gray-100 gap-4">
                    <span className="text-sm text-gray-700 font-medium">
                      Page <span className="font-bold">{userPage}</span> of <span className="font-bold">{maxUserPage}</span>
                    </span>
                    <div className="flex space-x-2 w-full sm:w-auto">
                      <button onClick={prevUser} disabled={userPage === 1} className="flex-1 sm:flex-none px-5 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm">Previous</button>
                      <button onClick={nextUser} disabled={userPage === maxUserPage} className="flex-1 sm:flex-none px-5 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm">Next</button>
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
            <div className="space-y-6 animate-fade-in-up">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentBookings().length === 0 ? (
                  <div className="col-span-full py-16 text-center flex flex-col items-center bg-white rounded-3xl border border-dashed border-gray-200">
                    <Camera className="w-12 h-12 text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">No completed jobs found on the platform yet.</p>
                  </div>
                ) : (
                  currentBookings().map((booking) => (
                    <div key={booking.id} className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between hover:shadow-md hover:border-blue-100 transition-all">
                      <div>
                        <div className="flex justify-between items-start mb-4 gap-2">
                          <h3 className="font-bold text-gray-900 text-lg">Job #{booking.id}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                            booking.status === "Completed" ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-700 border-gray-200"
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600 flex justify-between border-b border-gray-50 pb-2"><span className="font-semibold text-gray-800">Customer:</span> {booking.customer_name || `User #${booking.customer_id}`}</p>
                          <p className="text-sm text-gray-600 flex justify-between"><span className="font-semibold text-gray-800">Provider:</span> {booking.provider_name || `Provider #${booking.provider_id}`}</p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100 bg-gray-50/50 p-3 rounded-xl">
                          <p className="text-sm text-gray-500 line-clamp-2 italic">"{booking.notes || "No notes provided."}"</p>
                        </div>
                      </div>

                      {booking.status === "Completed" && (
                        <button onClick={() => setAuditModal(booking)} className="mt-6 w-full flex items-center justify-center gap-2 bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-colors shadow-sm">
                          <ImageIcon size={16} /> View Evidence
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              {maxBookingPage > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-white rounded-3xl shadow-sm border border-gray-200 gap-4">
                  <span className="text-sm text-gray-700 font-medium">
                    Page <span className="font-bold">{bookingPage}</span> of <span className="font-bold">{maxBookingPage}</span>
                  </span>
                  <div className="flex space-x-2 w-full sm:w-auto">
                    <button onClick={prevBooking} disabled={bookingPage === 1} className="flex-1 sm:flex-none px-5 py-2 text-sm font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 disabled:opacity-50 transition-colors shadow-sm">Previous</button>
                    <button onClick={nextBooking} disabled={bookingPage === maxBookingPage} className="flex-1 sm:flex-none px-5 py-2 text-sm font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 disabled:opacity-50 transition-colors shadow-sm">Next</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Audit Modal */}
      {auditModal && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all" onClick={() => setAuditModal(null)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full p-8 relative overflow-hidden animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                <Camera className="text-blue-600" /> Job #{auditModal.id} Audit
              </h3>
              <button onClick={() => setAuditModal(null)} className="text-gray-400 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></span>
                  <h4 className="font-bold text-gray-800 uppercase tracking-wider text-sm">Before Service</h4>
                </div>
                <div className="bg-gray-50 rounded-2xl h-48 md:h-72 border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center group relative shadow-inner">
                  {auditModal.before_image_url || auditModal.beforeImage ? (
                    <img src={auditModal.before_image_url || auditModal.beforeImage} alt="Before" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <span className="text-gray-400 font-medium text-sm flex flex-col items-center gap-2"><ImageIcon size={24}/> No image uploaded</span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></span>
                  <h4 className="font-bold text-gray-800 uppercase tracking-wider text-sm">After Service</h4>
                </div>
                <div className="bg-gray-50 rounded-2xl h-48 md:h-72 border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center group relative shadow-inner">
                  {auditModal.after_image_url || auditModal.afterImage ? (
                    <img src={auditModal.after_image_url || auditModal.afterImage} alt="After" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <span className="text-gray-400 font-medium text-sm flex flex-col items-center gap-2"><ImageIcon size={24}/> No image uploaded</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}