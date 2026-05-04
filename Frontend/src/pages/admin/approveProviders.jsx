import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import usePagination from "../../hooks/usePagination"; 
import { fetchAllProviders, toggleProviderApproval, clearAdminMessages } from "../../redux/slices/adminSlice";
import { useToast } from "../../hooks/toastHook"; 
import LoadingSpinner from "../../components/common/loadingSpinner";
import { ShieldCheck, ShieldAlert, FileText, Users, Activity, ExternalLink } from "lucide-react";

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

export default function ApproveProviders() {
  const dispatch = useDispatch();
  const { showSuccess, showError, showLoading, dismissToast } = useToast();
  const { providers, isLoading } = useSelector((state) => state.admin);

  useEffect(() => {
    if (providers.length === 0) dispatch(fetchAllProviders());
    return () => dispatch(clearAdminMessages());
  }, [dispatch, providers.length]);

  const handleApproval = async (profileId, status) => {
    const actionText = status ? "Approving provider..." : "Revoking access...";
    const loadingId = showLoading(actionText);

    const res = await dispatch(toggleProviderApproval({ profileId, isApproved: status }));
    dismissToast(loadingId); 

    if (!res.error) {
      showSuccess(`Provider successfully ${status ? 'approved ✅' : 'revoked 🚫'}`);
    } else {
      showError(res.payload || "Failed to update provider status.");
    }
  };

  const { next, prev, currentData, currentPage, maxPage } = usePagination(providers, 5);

  // --- MOCK DATA FOR CHARTS ---
  const lineChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Completed Jobs',
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
        data: [65, 30, 5],
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
      legend: { position: 'bottom', labels: { font: { family: 'Inter', weight: 'bold' }, padding: 20 } },
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 left-[10%] w-[40%] h-[40%] bg-blue-300/20 rounded-full mix-blend-multiply filter blur-[100px]"></div>
        <div className="absolute bottom-[20%] right-[10%] w-[40%] h-[40%] bg-indigo-300/20 rounded-full mix-blend-multiply filter blur-[100px]"></div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8 pt-24 md:pt-28 px-4 sm:px-6 pb-24 md:pb-12 relative z-10">
        
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2 font-medium text-lg">Platform overview and provider approvals.</p>
        </div>

        {/* 🌟 CHARTS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white/60 backdrop-blur-xl rounded-[2rem] shadow-sm border border-white/60 p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Activity size={20} className="text-blue-500"/> Completed Jobs Overview
              </h2>
              <span className="text-xs font-extrabold text-blue-700 bg-blue-100 px-3 py-1 rounded-full uppercase tracking-wider">This Week</span>
            </div>
            <div className="h-[250px] w-full">
              <Line data={lineChartData} options={lineChartOptions} />
            </div>
          </div>

          <div className="lg:col-span-1 bg-white/60 backdrop-blur-xl rounded-[2rem] shadow-sm border border-white/60 p-6 md:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Users size={20} className="text-purple-500"/> Active Users
            </h2>
            <div className="h-[250px] w-full relative">
              <Doughnut data={doughnutData} options={doughnutOptions} />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none mt-[-30px]">
                <div className="text-center">
                  <span className="block text-3xl font-extrabold text-gray-900">10k+</span>
                  <span className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Total</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🌟 PROVIDER TABLE */}
        <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 overflow-hidden">
          <div className="px-6 py-5 md:px-8 md:py-6 border-b border-gray-200/50">
            <h2 className="text-xl font-bold text-gray-900">Provider Applications</h2>
          </div>

          {/* 🌟 NEW: Updated grid columns to 5 to fit Documents */}
          <div className="hidden md:grid grid-cols-5 gap-6 px-8 py-4 bg-white/40 border-b border-gray-200/50 text-xs font-extrabold text-gray-500 uppercase tracking-widest">
            <div>Provider</div>
            <div>Document</div>
            <div>Bio</div>
            <div>Status</div>
            <div className="text-right">Actions</div>
          </div>

          <div className="divide-y divide-gray-200/50">
            {isLoading && providers.length === 0 ? (
              <div className="py-20">
                <LoadingSpinner fullScreen={false} message="Loading applicants..." />
              </div>
            ) : currentData().length === 0 ? (
              <div className="px-6 py-20 text-center text-gray-500 flex flex-col items-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                  <FileText className="w-8 h-8 text-gray-300" />
                </div>
                <span className="font-bold text-lg text-gray-900">No providers applied yet.</span>
              </div>
            ) : (
              currentData().map((p) => (
                <div key={p.profile_id} className="flex flex-col md:grid md:grid-cols-5 gap-4 md:gap-6 md:items-center px-6 md:px-8 py-6 hover:bg-white/80 transition-all">
                  
                  {/* Avatar & Name */}
                  <div className="flex items-center gap-3">
                    <img 
                      src={p.profile_image || "https://res.cloudinary.com/demo/image/upload/v1580995054/avatar.png"} 
                      alt="avatar" 
                      className="w-12 h-12 rounded-full object-cover shadow-sm border border-gray-200"
                    />
                    <div>
                      <div className="font-extrabold text-gray-900 text-base leading-tight">{p.name}</div>
                      <div className="text-[11px] font-bold text-gray-500 mt-0.5">{p.email}</div>
                    </div>
                  </div>

                  {/* Document Link */}
                  <div>
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest md:hidden block mb-1.5">Verification</span>
                    {p.document_url ? (
                      <a 
                        href={p.document_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors border border-purple-100"
                      >
                        View PDF <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span className="text-xs font-bold text-gray-400">Not Uploaded</span>
                    )}
                  </div>

                  {/* Bio */}
                  <div>
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest md:hidden block mb-1.5">Biography</span>
                    <p className="text-xs font-medium text-gray-600 line-clamp-2">{p.bio || "No biography provided."}</p>
                  </div>

                  {/* Status */}
                  <div>
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest md:hidden block mb-2">Account Status</span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] md:text-xs font-extrabold uppercase tracking-wider border shadow-sm ${
                      p.is_approved ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {p.is_approved ? <ShieldCheck size={14}/> : <ShieldAlert size={14}/>}
                      {p.is_approved ? 'Approved' : 'Pending'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 md:mt-0 md:text-right flex justify-end">
                    {!p.is_approved ? (
                      <button onClick={() => handleApproval(p.profile_id, true)} disabled={isLoading} className="w-full md:w-auto bg-gray-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-all shadow-md active:scale-95">
                        Approve
                      </button>
                    ) : (
                      <button onClick={() => handleApproval(p.profile_id, false)} disabled={isLoading} className="w-full md:w-auto text-red-600 bg-white border border-red-200 text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-red-50 disabled:opacity-50 transition-all shadow-sm active:scale-95">
                        Revoke
                      </button>
                    )}
                  </div>

                </div>
              ))
            )}
          </div>
          
          {maxPage > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 md:px-8 py-5 bg-white/40 border-t border-gray-200/50 gap-4">
              <span className="text-sm text-gray-600 font-medium">Page <span className="font-extrabold text-gray-900">{currentPage}</span> of <span className="font-extrabold text-gray-900">{maxPage}</span></span>
              <div className="flex space-x-3 w-full sm:w-auto">
                <button onClick={prev} disabled={currentPage === 1} className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold text-gray-700 bg-white border border-white rounded-xl hover:shadow-md disabled:opacity-40 transition-all shadow-sm">Previous</button>
                <button onClick={next} disabled={currentPage === maxPage} className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold text-gray-700 bg-white border border-white rounded-xl hover:shadow-md disabled:opacity-40 transition-all shadow-sm">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}