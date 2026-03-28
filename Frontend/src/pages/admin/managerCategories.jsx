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
    <div className="max-w-5xl mx-auto space-y-8 mt-4 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Manage Categories</h1>
        <p className="text-gray-500 mt-2 text-lg">Create and organize the service types offered on LocalHub.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
        {/* Decorative Top Border */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-900"></div>
        
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900">
          <FolderPlus size={20} className="text-blue-600"/> Add New Category
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Category Name</label>
              <input 
                type="text" 
                placeholder="e.g. Plumbing, Cleaning..." 
                value={newCategory.name} 
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-shadow bg-gray-50 focus:bg-white" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Short Description</label>
              <input 
                type="text" 
                placeholder="Briefly describe the service..." 
                value={newCategory.description} 
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })} 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-shadow bg-gray-50 focus:bg-white" 
                required 
              />
            </div>
          </div>
          <div className="pt-2">
            <button type="submit" disabled={adminLoading} className="w-full sm:w-auto bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2">
              {adminLoading ? "Processing..." : "Create Category"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-1/3">Name</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Description</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categoriesLoading ? (
              <tr><td colSpan="3" className="py-16"><LoadingSpinner fullScreen={false} message="Loading categories..." /></td></tr>
            ) : currentData().length === 0 ? (
              <tr><td colSpan="3" className="px-6 py-16 text-center text-gray-500 bg-gray-50/50 flex flex-col items-center"><Layers className="w-10 h-10 text-gray-300 mb-3"/>No categories found.</td></tr>
            ) : (
              currentData().map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-6 py-5 font-bold text-gray-900 text-base">{cat.name}</td>
                  <td className="px-6 py-5 text-sm text-gray-500 hidden sm:table-cell">{cat.description}</td>
                  <td className="px-6 py-5 text-right">
                    <button onClick={() => handleDelete(cat.id)} disabled={adminLoading} className="inline-flex items-center gap-1 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg text-sm font-bold disabled:opacity-50 transition-colors">
                      <Trash2 size={16} /> <span className="hidden sm:inline">Delete</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {maxPage > 1 && (
          <div className="flex items-center justify-between px-6 py-5 bg-gray-50/80 border-t border-gray-100">
            <span className="text-sm text-gray-700 font-medium">Page <span className="font-bold text-gray-900">{currentPage}</span> of <span className="font-bold text-gray-900">{maxPage}</span></span>
            <div className="flex space-x-3">
              <button onClick={prev} disabled={currentPage === 1} className="px-4 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 disabled:opacity-40 transition-colors shadow-sm">Previous</button>
              <button onClick={next} disabled={currentPage === maxPage} className="px-4 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 disabled:opacity-40 transition-colors shadow-sm">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}