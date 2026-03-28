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
  const activeJobs = bookings.filter((b) =>
    ["Confirmed", "In-progress"].includes(b.status)
  );
  const historyJobs = bookings.filter((b) =>
    ["Completed", "Cancelled"].includes(b.status)
  );

  const currentJobs =
    activeTab === "requests"
      ? requestedJobs
      : activeTab === "active"
        ? activeJobs
        : historyJobs;

  const handleStatusChange = async (bookingId, status) => {
    const loadingId = showLoading(`Updating status to ${status}...`);
    const res = await dispatch(updateBookingStatus({ bookingId, status }));
    dismissToast(loadingId);

    if (!res.error) {
      showSuccess(
        `Job ${status === "Confirmed" ? "accepted!" : status === "Cancelled" ? "declined." : "started!"}`
      );
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

    const res = await dispatch(
      completeJob({ bookingId: completingJobId, formData })
    )
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
      updateBookingPrice({
        bookingId: editingPriceJobId,
        newPrice: Number(newPrice),
      })
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

    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading && bookings.length === 0) {
    return <LoadingSpinner fullScreen={false} message="Loading your jobs..." />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 mt-4 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Manage Jobs
        </h1>
        <p className="text-gray-500 mt-2 text-lg">
          Review requests, update statuses, and complete your work.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("requests")}
          className={`pb-4 px-1 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${activeTab === "requests" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-800"}`}
        >
          <Clock size={18} /> Requests
          <span
            className={`ml-1.5 py-0.5 px-2.5 rounded-full text-xs transition-colors ${activeTab === "requests" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}
          >
            {requestedJobs.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("active")}
          className={`pb-4 px-1 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${activeTab === "active" ? "border-amber-500 text-amber-500" : "border-transparent text-gray-500 hover:text-gray-800"}`}
        >
          <Briefcase size={18} /> Active Jobs
          <span
            className={`ml-1.5 py-0.5 px-2.5 rounded-full text-xs transition-colors ${activeTab === "active" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}
          >
            {activeJobs.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-4 px-1 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${activeTab === "history" ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-800"}`}
        >
          <History size={18} /> History
          <span
            className={`ml-1.5 py-0.5 px-2.5 rounded-full text-xs transition-colors ${activeTab === "history" ? "bg-gray-200 text-gray-800" : "bg-gray-100 text-gray-600"}`}
          >
            {historyJobs.length}
          </span>
        </button>
      </div>

      {/* Job List */}
      <div className="space-y-4">
        {currentJobs.length === 0 ? (
          <div className="bg-gray-50/50 rounded-2xl border border-gray-200 border-dashed p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100">
              {activeTab === "requests" ? (
                <Clock className="w-8 h-8 text-blue-400" />
              ) : activeTab === "active" ? (
                <Briefcase className="w-8 h-8 text-amber-400" />
              ) : (
                <History className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              No {activeTab} jobs
            </h3>
            <p className="text-gray-500">
              There are currently no jobs in this category.
            </p>
          </div>
        ) : (
          currentJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md hover:border-blue-100 transition-all group"
            >
              <div className="space-y-4 flex-1">
                <div className="flex items-center space-x-3">
                  <h3 className="text-xl font-bold text-gray-900">
                    Booking #{job.id}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                      job.status === "Requested"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : job.status === "Confirmed"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : job.status === "In-progress"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : job.status === "Completed"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-red-50 text-red-700 border-red-200"
                    }`}
                  >
                    {job.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <CalendarClock size={16} className="text-gray-400" />{" "}
                    <span className="font-semibold text-gray-700">Date:</span>{" "}
                    {formatDate(job.scheduledDate || job.scheduled_date)}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <MapPin size={16} className="text-gray-400" />{" "}
                    <span className="font-semibold text-gray-700">
                      Address:
                    </span>{" "}
                    {job.address}
                  </p>

                  {job.phone_number && (
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Phone size={16} className="text-gray-400" />{" "}
                      <span className="font-semibold text-gray-700">
                        Contact:
                      </span>{" "}
                      <a
                        href={`tel:${job.phone_number}`}
                        className="text-blue-600 font-bold hover:underline"
                      >
                        {job.phone_number}
                      </a>
                    </p>
                  )}

                  {/* 🌟 NEW: Display the Price on the Card */}
                  {job.price > 0 && (
                    <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                      <span className="font-semibold text-gray-700 px-1.5 py-0.5 bg-gray-100 rounded-md border border-gray-200 text-xs tracking-wide">
                        FINAL PRICE
                      </span>
                      <span className="font-bold text-gray-900">
                        ₹{job.price}
                      </span>
                    </p>
                  )}
                </div>

                {job.notes && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-600 italic">
                    "{job.notes}"
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col justify-center space-y-3 shrink-0 md:w-56 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                {job.status === "Requested" && (
                  <>
                    <button
                      onClick={() => handleStatusChange(job.id, "Confirmed")}
                      disabled={isLoading}
                      className="w-full bg-gray-900 text-white text-sm font-bold py-3 rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-all shadow-md"
                    >
                      Accept Job
                    </button>
                    <button
                      onClick={() => handleStatusChange(job.id, "Cancelled")}
                      disabled={isLoading}
                      className="w-full bg-white border border-red-200 text-red-600 text-sm font-bold py-2.5 rounded-xl hover:bg-red-50 disabled:opacity-50 transition-colors"
                    >
                      Decline
                    </button>
                  </>
                )}

                {job.status === "Confirmed" && (
                  <button
                    onClick={() => handleStatusChange(job.id, "In-progress")}
                    disabled={isLoading}
                    className="w-full bg-purple-600 text-white text-sm font-bold py-3 rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-all shadow-md"
                  >
                    Start Job (In-Progress)
                  </button>
                )}

                {job.status === "In-progress" && (
                  <button
                    onClick={() => setCompletingJobId(job.id)}
                    className="w-full bg-green-600 text-white text-sm font-bold py-3 rounded-xl hover:bg-green-700 transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <Camera size={16} /> Complete Job
                  </button>
                )}

                {["Requested", "Confirmed", "In-progress"].includes(
                  job.status
                ) && (
                  <button
                    onClick={() => {
                      setEditingPriceJobId(job.id);
                      setNewPrice(job.price || "");
                    }}
                    className="w-full bg-blue-50 text-blue-700 border border-blue-200 text-sm font-bold py-2.5 rounded-xl hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <FileEdit size={16} className="text-blue-600" /> Update
                    Price
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ========================================= */}
      {/*  NEW: UPDATE PRICE MODAL */}
      {/* ========================================= */}
      {editingPriceJobId && (
        <div
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all"
          onClick={() => setEditingPriceJobId(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-400 to-indigo-500"></div>

            <h3 className="text-2xl font-extrabold text-gray-900 mb-1">
              Update Final Price
            </h3>
            <p className="text-sm text-gray-500 mb-6 font-medium">
              Set the final amount for Booking #{editingPriceJobId}.
            </p>

            <form onSubmit={handlePriceUpdate} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Final Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 font-bold text-lg"
                  placeholder="e.g. 1500"
                />
              </div>

              <div className="flex space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingPriceJobId(null)}
                  className="flex-1 bg-white border border-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md"
                >
                  {isLoading ? "Saving..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* COMPLETION MODAL */}
      {/* ========================================= */}
      {completingJobId && (
        <div
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all"
          onClick={() => {
            setCompletingJobId(null);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-green-400 to-green-600"></div>

            <h3 className="text-2xl font-extrabold text-gray-900 mb-1">
              Complete Job #{completingJobId}
            </h3>
            <p className="text-sm text-gray-500 mb-8 font-medium">
              Upload evidence of your work for the customer and admin to review.
            </p>

            <form onSubmit={handleCompleteSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Before Image <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold">
                          {files.beforeImage
                            ? files.beforeImage.name
                            : "Click to upload before photo"}
                        </span>
                      </p>
                    </div>
                    <input
                      required
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setFiles({ ...files, beforeImage: e.target.files[0] })
                      }
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  After Image <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-green-300 border-dashed rounded-xl cursor-pointer bg-green-50 hover:bg-green-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <p className="text-sm text-green-700">
                        <span className="font-semibold">
                          {files.afterImage
                            ? files.afterImage.name
                            : "Click to upload after photo"}
                        </span>
                      </p>
                    </div>
                    <input
                      required
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setFiles({ ...files, afterImage: e.target.files[0] })
                      }
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setCompletingJobId(null);
                  }}
                  className="flex-1 bg-white border border-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 disabled:opacity-50 transition-all shadow-md"
                >
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
