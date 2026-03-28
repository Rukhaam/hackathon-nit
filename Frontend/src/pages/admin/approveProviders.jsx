import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import usePagination from "../../hooks/usePagination"; 
import { fetchAllProviders, toggleProviderApproval, clearAdminMessages } from "../../redux/slices/adminSlice";
import { useToast } from "../../hooks/toastHook"; 
import LoadingSpinner from "../../components/common/loadingSpinner";
import { ShieldCheck, ShieldAlert, FileText } from "lucide-react";

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

  return (
    <div className="max-w-6xl mx-auto space-y-8 mt-4 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Provider Approvals</h1>
        <p className="text-gray-500 mt-2 text-lg">Review and manage professional service accounts.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="hidden md:grid grid-cols-4 gap-6 px-6 py-4 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
          <div>Provider</div>
          <div>Bio</div>
          <div>Status</div>
          <div className="text-right">Actions</div>
        </div>

        <div className="divide-y divide-gray-100">
          {isLoading && providers.length === 0 ? (
            <div className="py-16">
              <LoadingSpinner fullScreen={false} message="Loading applicants..." />
            </div>
          ) : currentData().length === 0 ? (
            <div className="px-6 py-16 text-center text-gray-500 bg-gray-50/50 flex flex-col items-center">
              <FileText className="w-12 h-12 text-gray-300 mb-3" />
              <span className="font-medium text-lg">No providers applied yet.</span>
            </div>
          ) : (
            currentData().map((p) => (
              <div key={p.profile_id} className="flex flex-col md:grid md:grid-cols-4 gap-4 md:gap-6 md:items-center px-6 py-6 hover:bg-gray-50 transition-colors">
                
                <div>
                  <div className="font-bold text-gray-900 text-lg md:text-base">{p.name}</div>
                  <div className="text-sm text-gray-500">{p.email}</div>
                </div>

                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider md:hidden block mb-1">Biography</span>
                  <p className="text-sm text-gray-600 line-clamp-3 md:line-clamp-2">{p.bio || "No biography provided."}</p>
                </div>

                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider md:hidden block mb-2">Account Status</span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm ${
                    p.is_approved ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {p.is_approved ? <ShieldCheck size={14}/> : <ShieldAlert size={14}/>}
                    {p.is_approved ? 'Approved' : 'Pending'}
                  </span>
                </div>

                <div className="mt-4 md:mt-0 md:text-right flex justify-end">
                  {!p.is_approved ? (
                    <button onClick={() => handleApproval(p.profile_id, true)} disabled={isLoading} className="w-full md:w-auto bg-gray-900 text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-all shadow-md">
                      Approve Access
                    </button>
                  ) : (
                    <button onClick={() => handleApproval(p.profile_id, false)} disabled={isLoading} className="w-full md:w-auto text-red-600 bg-white border border-red-200 text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-red-50 disabled:opacity-50 transition-all shadow-sm">
                      Revoke Access
                    </button>
                  )}
                </div>

              </div>
            ))
          )}
        </div>
        
        {maxPage > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-5 bg-gray-50/80 border-t border-gray-100 gap-4">
            <span className="text-sm text-gray-600 font-medium">Page <span className="font-bold text-gray-900">{currentPage}</span> of <span className="font-bold text-gray-900">{maxPage}</span></span>
            <div className="flex space-x-3 w-full sm:w-auto">
              <button onClick={prev} disabled={currentPage === 1} className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 disabled:opacity-40 transition-colors shadow-sm">Previous</button>
              <button onClick={next} disabled={currentPage === maxPage} className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 disabled:opacity-40 transition-colors shadow-sm">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}