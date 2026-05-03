import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import usePagination from "../../hooks/usePagination"; 
import { fetchCategories } from "../../redux/slices/exploreSlice";
import { createCategory, deleteCategory, clearAdminMessages } from "../../redux/slices/adminSlice";
import { useToast } from "../../hooks/toastHook"; 
import LoadingSpinner from "../../components/common/loadingSpinner";
import { FolderPlus, Trash2, Layers } from "lucide-react";

export default function ManagerCategories() {
  const dispatch = useDispatch();
  const { showSuccess, showError, showLoading, dismissToast } = useToast();
  
  const { categories, isLoading: categoriesLoading } = useSelector((state) => state.explore);
  const { isLoading: adminLoading } = useSelector((state) => state.admin);

  const [newCategory, setNewCategory] = useState({ name: "", description: "" });

  useEffect(() => {
    if (categories.length === 0) dispatch(fetchCategories());
    return () => dispatch(clearAdminMessages());
  }, [dispatch, categories.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingId = showLoading("Creating category...");
    const res = await dispatch(createCategory(newCategory));
    dismissToast(loadingId); 

    if (!res.error) {
      showSuccess(`"${newCategory.name}" category added successfully! 📁`);
      setNewCategory({ name: "", description: "" });
    } else {
      showError(res.payload || "Failed to create category.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure? This might affect providers in this category.")) {
      const loadingId = showLoading("Deleting category...");
      const res = await dispatch(deleteCategory(id));
      dismissToast(loadingId);

      if (!res.error) {
        showSuccess("Category deleted successfully! 🗑️");
      } else {
        showError("Failed to delete category.");
      }
    }
  };

  const { next, prev, currentData, currentPage, maxPage } = usePagination(categories, 5);

  return (
    <div className="relative min-h-screen">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[20%] left-[-10%] w-[50%] h-[50%] bg-emerald-300/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-blue-300/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-5xl mx-auto space-y-8 pt-24 md:pt-28 px-4 sm:px-6 pb-24 md:pb-12 relative z-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Manage Categories</h1>
          <p className="text-gray-600 mt-2 font-medium text-lg">Create and organize the service types offered on LocalHub.</p>
        </div>

        {/* FORM CARD */}
        <div className="bg-white/60 backdrop-blur-xl p-6 md:p-10 rounded-[2rem] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
          
          <h2 className="text-xl md:text-2xl font-extrabold mb-6 flex items-center gap-2.5 text-gray-900">
            <FolderPlus size={24} className="text-blue-500"/> Add New Category
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs md:text-sm font-extrabold uppercase tracking-wider text-gray-500 mb-2">Category Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Plumbing, Cleaning..." 
                  value={newCategory.name} 
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} 
                  className="w-full px-5 py-3.5 bg-white/50 border border-white/60 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-bold text-gray-900 transition-all shadow-sm" 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-extrabold uppercase tracking-wider text-gray-500 mb-2">Short Description</label>
                <input 
                  type="text" 
                  placeholder="Briefly describe the service..." 
                  value={newCategory.description} 
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })} 
                  className="w-full px-5 py-3.5 bg-white/50 border border-white/60 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-bold text-gray-900 transition-all shadow-sm" 
                  required 
                />
              </div>
            </div>
            <div className="pt-4">
              <button type="submit" disabled={adminLoading} className="w-full sm:w-auto bg-gray-900 text-white px-10 py-4 rounded-xl text-sm font-extrabold hover:bg-gray-800 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 active:scale-95">
                {adminLoading ? "Processing..." : "Create Category"}
              </button>
            </div>
          </form>
        </div>

        {/* TABLE CARD */}
        <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white/40 border-b border-gray-200/50">
              <tr>
                <th className="px-6 md:px-8 py-5 text-[10px] md:text-xs font-extrabold text-gray-500 uppercase tracking-widest w-1/3">Name</th>
                <th className="px-6 md:px-8 py-5 text-[10px] md:text-xs font-extrabold text-gray-500 uppercase tracking-widest hidden sm:table-cell">Description</th>
                <th className="px-6 md:px-8 py-5 text-[10px] md:text-xs font-extrabold text-gray-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50">
              {categoriesLoading ? (
                <tr><td colSpan="3" className="py-20"><LoadingSpinner fullScreen={false} message="Loading categories..." /></td></tr>
              ) : currentData().length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-20 text-center text-gray-500 flex flex-col items-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                      <Layers className="w-8 h-8 text-gray-300"/>
                    </div>
                    <span className="font-bold text-lg text-gray-900">No categories found.</span>
                  </td>
                </tr>
              ) : (
                currentData().map((cat) => (
                  <tr key={cat.id} className="hover:bg-white/80 transition-colors group">
                    <td className="px-6 md:px-8 py-6 font-extrabold text-gray-900 text-base">{cat.name}</td>
                    <td className="px-6 md:px-8 py-6 text-sm font-medium text-gray-600 hidden sm:table-cell">{cat.description}</td>
                    <td className="px-6 md:px-8 py-6 text-right">
                      <button onClick={() => handleDelete(cat.id)} disabled={adminLoading} className="inline-flex items-center gap-1.5 text-red-500 hover:text-red-700 bg-white border border-red-100 shadow-sm hover:shadow-md px-4 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 transition-all active:scale-95">
                        <Trash2 size={16} /> <span className="hidden sm:inline">Delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
          {maxPage > 1 && (
            <div className="flex items-center justify-between px-6 md:px-8 py-5 bg-white/40 border-t border-gray-200/50">
              <span className="text-sm text-gray-600 font-medium">Page <span className="font-extrabold text-gray-900">{currentPage}</span> of <span className="font-extrabold text-gray-900">{maxPage}</span></span>
              <div className="flex space-x-3">
                <button onClick={prev} disabled={currentPage === 1} className="px-5 py-2.5 text-sm font-bold text-gray-700 bg-white border border-white rounded-xl hover:shadow-md disabled:opacity-40 transition-all shadow-sm active:scale-95">Previous</button>
                <button onClick={next} disabled={currentPage === maxPage} className="px-5 py-2.5 text-sm font-bold text-gray-700 bg-white border border-white rounded-xl hover:shadow-md disabled:opacity-40 transition-all shadow-sm active:scale-95">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}