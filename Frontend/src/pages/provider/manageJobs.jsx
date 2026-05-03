import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchMyBookings,
  updateBookingStatus,
  completeJob,
  clearBookingMessages,
  updateBookingPrice,
} from "../../redux/slices/bookingSlice";
import { useToast } from "../../hooks/toastHook";
import LoadingSpinner from "../../components/common/loadingSpinner";
import {
  Clock,
  Briefcase,
  History,
  Phone,
  MapPin,
  CalendarClock,
  Camera,
  FileEdit,
  IndianRupee
} from "lucide-react";

export default function ManageJobs() {
  const dispatch = useDispatch();
  const { showSuccess, showError, showLoading, dismissToast } = useToast();

  const { items: bookings, isLoading } = useSelector((state) => state.bookings);

  const [activeTab, setActiveTab] = useState("requests");
  const [completingJobId, setCompletingJobId] = useState(null);
  const [files, setFiles] = useState({ beforeImage: null, afterImage: null });

  const [editingPriceJobId, setEditingPriceJobId] = useState(null);
  const [newPrice, setNewPrice] = useState("");

  useEffect(() => {
    dispatch(fetchMyBookings());
    return () => dispatch(clearBookingMessages());
  }, [dispatch]);

  const requestedJobs = bookings.filter((b) => b.status === "Requested");
  const activeJobs = bookings.filter((b) => ["Confirmed", "In-progress"].includes(b.status));
  const historyJobs = bookings.filter((b) => ["Completed", "Cancelled"].includes(b.status));

  const currentJobs =
    activeTab === "requests" ? requestedJobs : activeTab === "active" ? activeJobs : historyJobs;

  const handleStatusChange = async (bookingId, status) => {
    const loadingId = showLoading(`Updating status to ${status}...`);
    const res = await dispatch(updateBookingStatus({ bookingId, status }));
    dismissToast(loadingId);

    if (!res.error) {
      showSuccess(`Job ${status === "Confirmed" ? "accepted!" : status === "Cancelled" ? "declined." : "started!"}`);
    } else {
      showError("Failed to update job status.");
    }
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    if (!files.beforeImage || !files.afterImage) {
      showError("Please upload both a Before and After image.");
      return;
    }
    const formData = new FormData();
    formData.append("beforeImage", files.beforeImage);
    formData.append("afterImage", files.afterImage);
    const loadingId = showLoading("Uploading photos and completing job...");
    const res = await dispatch(completeJob({ bookingId: completingJobId, formData }))
      .unwrap()
      .catch(() => ({ error: true }));
    dismissToast(loadingId);
    if (!res.error) {
      showSuccess("Job completed successfully! Great work! 🎉");
      setCompletingJobId(null);
      setFiles({ beforeImage: null, afterImage: null });
    } else {
      showError("Failed to upload images. Please try again.");
    }
  };

  const handlePriceUpdate = async (e) => {
    e.preventDefault();
    if (!newPrice || isNaN(newPrice) || newPrice <= 0) {
      showError("Please enter a valid price amount.");
      return;
    }
    const loadingId = showLoading("Updating final price...");
    const res = await dispatch(
      updateBookingPrice({ bookingId: editingPriceJobId, newPrice: Number(newPrice) })
    );
    dismissToast(loadingId);
    if (!res.error) {
      showSuccess("Price updated successfully! 💵");
      setEditingPriceJobId(null);
      setNewPrice("");
    } else {
      showError(res.payload || "Failed to update price.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No Date Set";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Date Pending";
    return date.toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" });
  };

  if (isLoading && bookings.length === 0) {
    return <LoadingSpinner fullScreen={false} message="Loading your jobs..." />;
  }

  return (
    <div className="relative min-h-screen">
      {/* Glassmorphic Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[10%] left-[-10%] w-[50%] h-[50%] bg-blue-300/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob"></div>
        <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-purple-300/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 pt-24 md:pt-28 px-4 sm:px-6 pb-24 md:pb-12 relative z-10">
        <div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Manage Jobs</h1>
          <p className="text-gray-600 mt-1.5 md:mt-2 text-sm md:text-lg font-medium">Review requests, update statuses, and complete your work.</p>
        </div>

        {/* 🌟 FIXED: TABS (Now scrollable on mobile so history isn't cut off) */}
        <div className="flex gap-4 md:gap-8 border-b border-gray-300/50 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <button
            onClick={() => setActiveTab("requests")}
            className={`pb-3 px-1 font-bold text-xs md:text-sm transition-all border-b-2 flex items-center gap-1.5 md:gap-2 whitespace-nowrap ${activeTab === "requests" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-800"}`}
          >
            <Clock size={16} className="md:w-[18px] md:h-[18px]" /> Requests
            <span className={`ml-1 py-0.5 px-2 rounded-full text-[10px] md:text-xs transition-colors ${activeTab === "requests" ? "bg-blue-100 text-blue-700" : "bg-white/50 text-gray-600"}`}>
              {requestedJobs.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("active")}
            className={`pb-3 px-1 font-bold text-xs md:text-sm transition-all border-b-2 flex items-center gap-1.5 md:gap-2 whitespace-nowrap ${activeTab === "active" ? "border-amber-500 text-amber-500" : "border-transparent text-gray-500 hover:text-gray-800"}`}
          >
            <Briefcase size={16} className="md:w-[18px] md:h-[18px]" /> Active
            <span className={`ml-1 py-0.5 px-2 rounded-full text-[10px] md:text-xs transition-colors ${activeTab === "active" ? "bg-amber-100 text-amber-700" : "bg-white/50 text-gray-600"}`}>
              {activeJobs.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`pb-3 px-1 font-bold text-xs md:text-sm transition-all border-b-2 flex items-center gap-1.5 md:gap-2 whitespace-nowrap ${activeTab === "history" ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-800"}`}
          >
            <History size={16} className="md:w-[18px] md:h-[18px]" /> History
            <span className={`ml-1 py-0.5 px-2 rounded-full text-[10px] md:text-xs transition-colors ${activeTab === "history" ? "bg-gray-200 text-gray-800" : "bg-white/50 text-gray-600"}`}>
              {historyJobs.length}
            </span>
          </button>
        </div>

        {/* Job List */}
        <div className="space-y-4 md:space-y-6">
          {currentJobs.length === 0 ? (
            <div className="bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/60 border-dashed p-10 md:p-16 text-center flex flex-col items-center shadow-sm">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100">
                {activeTab === "requests" ? <Clock className="w-6 h-6 md:w-8 md:h-8 text-blue-400" /> : activeTab === "active" ? <Briefcase className="w-6 h-6 md:w-8 md:h-8 text-amber-400" /> : <History className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />}
              </div>
              <h3 className="text-base md:text-lg font-extrabold text-gray-900 mb-1.5">No {activeTab} jobs</h3>
              <p className="text-xs md:text-sm text-gray-500 font-medium">There are currently no jobs in this category.</p>
            </div>
          ) : (
            currentJobs.map((job) => (
              <div key={job.id} className="bg-white/60 backdrop-blur-xl rounded-[1.5rem] md:rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 p-5 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5 md:gap-8 hover:bg-white/80 transition-all">
                <div className="space-y-3.5 flex-1">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-lg md:text-2xl font-extrabold text-gray-900">Booking #{job.id}</h3>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] md:text-xs font-extrabold uppercase tracking-wider border ${
                      job.status === "Requested" ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm" :
                      job.status === "Confirmed" ? "bg-amber-50 text-amber-700 border-amber-200 shadow-sm" :
                      job.status === "In-progress" ? "bg-purple-50 text-purple-700 border-purple-200 shadow-sm" :
                      job.status === "Completed" ? "bg-green-50 text-green-700 border-green-200 shadow-sm" :
                      "bg-red-50 text-red-700 border-red-200 shadow-sm"
                    }`}>
                      {job.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 md:gap-4">
                    <p className="text-xs md:text-sm text-gray-600 flex items-center gap-1.5 font-medium">
                      <CalendarClock size={14} className="text-gray-400 md:w-[16px] md:h-[16px]" /> <span className="font-bold text-gray-800">Date:</span> {formatDate(job.scheduledDate || job.scheduled_date)}
                    </p>
                    <p className="text-xs md:text-sm text-gray-600 flex items-center gap-1.5 font-medium">
                      <MapPin size={14} className="text-gray-400 md:w-[16px] md:h-[16px]" /> <span className="font-bold text-gray-800">Address:</span> <span className="truncate max-w-[150px] md:max-w-xs">{job.address}</span>
                    </p>

                    {job.phone_number && (
                      <p className="text-xs md:text-sm text-gray-600 flex items-center gap-1.5 font-medium">
                        <Phone size={14} className="text-gray-400 md:w-[16px] md:h-[16px]" /> <span className="font-bold text-gray-800">Contact:</span> 
                        <a href={`tel:${job.phone_number}`} className="text-blue-600 font-bold hover:underline">{job.phone_number}</a>
                      </p>
                    )}

                    {job.price > 0 && (
                      <p className="text-xs md:text-sm text-gray-600 flex items-center gap-1.5 mt-1">
                        <span className="font-extrabold text-gray-700 px-2 py-0.5 bg-white rounded border border-gray-200 shadow-sm text-[10px] md:text-xs tracking-widest">FINAL PRICE</span>
                        <span className="font-black text-gray-900 text-sm md:text-base">₹{job.price}</span>
                      </p>
                    )}
                  </div>

                  {job.notes && (
                    <div className="mt-3 p-3 bg-white/50 rounded-xl border border-white/60 text-xs md:text-sm text-gray-700 italic font-medium shadow-inner">
                      "{job.notes}"
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-center space-y-2.5 shrink-0 md:w-56 border-t md:border-t-0 md:border-l border-gray-200/50 pt-4 md:pt-0 md:pl-6">
                  {job.status === "Requested" && (
                    <div className="flex flex-row md:flex-col gap-2 w-full">
                      <button onClick={() => handleStatusChange(job.id, "Confirmed")} disabled={isLoading} className="flex-1 w-full bg-gray-900 text-white text-xs md:text-sm font-bold py-2.5 md:py-3 rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-all shadow-md active:scale-95">Accept Job</button>
                      <button onClick={() => handleStatusChange(job.id, "Cancelled")} disabled={isLoading} className="flex-1 w-full bg-white border border-red-200 text-red-600 text-xs md:text-sm font-bold py-2.5 md:py-3 rounded-xl hover:bg-red-50 disabled:opacity-50 transition-all shadow-sm active:scale-95">Decline</button>
                    </div>
                  )}

                  {job.status === "Confirmed" && (
                    <button onClick={() => handleStatusChange(job.id, "In-progress")} disabled={isLoading} className="w-full bg-purple-600 text-white text-xs md:text-sm font-bold py-3 rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-all shadow-md active:scale-95">Start Job (In-Progress)</button>
                  )}

                  {job.status === "In-progress" && (
                    <button onClick={() => setCompletingJobId(job.id)} className="w-full bg-green-600 text-white text-xs md:text-sm font-bold py-3 rounded-xl hover:bg-green-700 transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95">
                      <Camera size={14} className="md:w-[16px] md:h-[16px]" /> Complete Job
                    </button>
                  )}

                  {["Requested", "Confirmed", "In-progress"].includes(job.status) && (
                    <button onClick={() => { setEditingPriceJobId(job.id); setNewPrice(job.price || ""); }} className="w-full bg-white text-blue-600 border border-blue-100 shadow-sm text-xs md:text-sm font-bold py-2.5 md:py-3 rounded-xl hover:bg-blue-50 transition-all flex items-center justify-center gap-1.5 active:scale-95">
                      <FileEdit size={14} className="text-blue-500 md:w-[16px] md:h-[16px]" /> Update Price
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ========================================= */}
      {/* 🌟 MODALS (With Glassmorphism) */}
      {/* ========================================= */}
      
      {editingPriceJobId && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 transition-all" onClick={() => setEditingPriceJobId(null)}>
          <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-sm w-full p-6 md:p-8 relative overflow-hidden animate-fade-in-up border border-white" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
            <h3 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-1">Update Final Price</h3>
            <p className="text-xs md:text-sm text-gray-500 mb-6 font-medium">Set the final amount for Booking #{editingPriceJobId}.</p>
            <form onSubmit={handlePriceUpdate} className="space-y-5">
              <div>
                <label className="block text-xs md:text-sm font-bold text-gray-700 mb-2">Final Amount (₹)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><IndianRupee size={16}/></div>
                  <input type="number" required min="1" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className="w-full pl-9 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 font-bold text-base md:text-lg" placeholder="1500" />
                </div>
              </div>
              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={() => setEditingPriceJobId(null)} className="flex-1 bg-white border border-gray-200 text-gray-700 font-bold py-2.5 md:py-3 rounded-xl hover:bg-gray-50 transition-colors text-xs md:text-sm">Cancel</button>
                <button type="submit" disabled={isLoading} className="flex-1 bg-blue-600 text-white font-bold py-2.5 md:py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md text-xs md:text-sm">
                  {isLoading ? "Saving..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {completingJobId && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 transition-all" onClick={() => setCompletingJobId(null)}>
          <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-md w-full p-6 md:p-8 relative overflow-hidden animate-fade-in-up border border-white" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-green-400 to-emerald-600"></div>
            <h3 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-1">Complete Job #{completingJobId}</h3>
            <p className="text-xs md:text-sm text-gray-500 mb-6 font-medium">Upload evidence of your work for the customer and admin to review.</p>
            <form onSubmit={handleCompleteSubmit} className="space-y-5">
              <div>
                <label className="block text-xs md:text-sm font-bold text-gray-700 mb-2">Before Image <span className="text-red-500">*</span></label>
                <label className="flex flex-col items-center justify-center w-full h-20 md:h-24 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-white/50 hover:bg-white transition-colors">
                  <span className="text-xs md:text-sm text-gray-500 font-semibold px-4 text-center line-clamp-1">
                    {files.beforeImage ? files.beforeImage.name : "Click to upload before photo"}
                  </span>
                  <input required type="file" accept="image/*" onChange={(e) => setFiles({ ...files, beforeImage: e.target.files[0] })} className="hidden" />
                </label>
              </div>
              <div>
                <label className="block text-xs md:text-sm font-bold text-gray-700 mb-2">After Image <span className="text-red-500">*</span></label>
                <label className="flex flex-col items-center justify-center w-full h-20 md:h-24 border-2 border-emerald-300 border-dashed rounded-xl cursor-pointer bg-emerald-50/50 hover:bg-emerald-50 transition-colors">
                  <span className="text-xs md:text-sm text-emerald-700 font-semibold px-4 text-center line-clamp-1">
                    {files.afterImage ? files.afterImage.name : "Click to upload after photo"}
                  </span>
                  <input required type="file" accept="image/*" onChange={(e) => setFiles({ ...files, afterImage: e.target.files[0] })} className="hidden" />
                </label>
              </div>
              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={() => setCompletingJobId(null)} className="flex-1 bg-white border border-gray-200 text-gray-700 font-bold py-2.5 md:py-3 rounded-xl hover:bg-gray-50 transition-colors text-xs md:text-sm">Cancel</button>
                <button type="submit" disabled={isLoading} className="flex-1 bg-emerald-600 text-white font-bold py-2.5 md:py-3 rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-md text-xs md:text-sm">
                  {isLoading ? "Uploading..." : "Submit Photos"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}