import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Star, ArrowRight, MapPin, Layers, ArrowLeft, ArrowUpDown } from "lucide-react";
import { fetchActiveProviders } from "../../redux/slices/exploreSlice";

export default function ServiceProviders() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    categories,
    providers,
    pagination,
    selectedCategoryId,
    isLoading,
  } = useSelector((state) => state.explore);

  const [searchArea] = useState(location.state?.searchArea || "");
  const [currentPage, setCurrentPage] = useState(1);
  
  // 🌟 NEW: State to track the active sorting method
  const [sortOrder, setSortOrder] = useState(""); // "" | "low-high" | "high-low"

  // Dynamically find the name of the category they clicked on the homepage
  const activeCategory = categories.find((c) => c.id === selectedCategoryId);

  useEffect(() => {
    // Only fetch if a category is selected (they came from the homepage click)
    if (selectedCategoryId) {
      dispatch(
        fetchActiveProviders({
          categoryId: selectedCategoryId,
          serviceArea: searchArea,
          page: 1,
        })
      );
    }
  }, [dispatch, selectedCategoryId, searchArea]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    dispatch(
      fetchActiveProviders({
        categoryId: selectedCategoryId,
        serviceArea: searchArea,
        page: newPage,
      })
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 🌟 NEW: Sort the providers array before mapping over it
  const sortedProviders = [...providers].sort((a, b) => {
    // Safely extract prices, defaulting to 0 if missing
    const priceA = Number(a.base_price || a.basePrice) || 0;
    const priceB = Number(b.base_price || b.basePrice) || 0;

    if (sortOrder === "low-high") return priceA - priceB;
    if (sortOrder === "high-low") return priceB - priceA;
    return 0; // Default order (usually by rating or newest)
  });

  return (
    <div className="min-h-screen bg-[#fafafa] w-full font-sans pb-24">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold text-sm mb-6 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Home
          </button>

          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            {activeCategory ? `Top ${activeCategory.name} Professionals` : "Find Your Professional"}
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl">
            {activeCategory 
              ? `Browse our network of verified ${activeCategory.name.toLowerCase()} experts ready to help you.`
              : "Please return to the homepage and select a service category to view available professionals."}
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {!selectedCategoryId ? (
          // Show this if they bypass the homepage and arrive without selecting a category
          <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-gray-200">
            <Layers className="w-16 h-16 text-blue-200 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900">
              No Service Selected
            </h3>
            <p className="text-gray-500 mt-2 max-w-md mx-auto mb-6">
              You need to select a specific service to view our professionals. Let's get you back to the categories.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md"
            >
              Explore Services
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 md:p-10">
            
            {/* 🌟 NEW: Sorting Controls */}
            {providers.length > 0 && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-100 pb-6 mb-8 gap-4">
                <p className="text-sm font-bold text-gray-500">
                  Showing {pagination?.totalItems || providers.length} professionals
                </p>
                
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                  <ArrowUpDown size={16} className="text-gray-500" />
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="bg-transparent text-sm font-bold text-gray-700 outline-none cursor-pointer py-1"
                  >
                    <option value="">Recommended Sort</option>
                    <option value="low-high">Price: Low to High</option>
                    <option value="high-low">Price: High to Low</option>
                  </select>
                </div>
              </div>
            )}

            {/* Provider Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div
                    key={n}
                    className="bg-gray-50 rounded-2xl h-64 border border-gray-100 animate-pulse"
                  ></div>
                ))}
              </div>
            ) : sortedProviders.length === 0 ? (
              <div className="text-center py-24 bg-gray-50 rounded-2xl border border-gray-200 border-dashed">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900">
                  No professionals found
                </h3>
                <p className="text-gray-500 mt-2">
                  We couldn't find any {activeCategory?.name.toLowerCase()} professionals {searchArea ? `in ${searchArea}` : 'right now'}.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProviders.map((provider) => (
                  <div
                    key={provider.profile_id}
                    className="group bg-white rounded-2xl border border-gray-200 p-6 flex flex-col hover:shadow-xl hover:border-blue-200 transition-all duration-300 relative overflow-hidden"
                  >
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {provider.name}
                          </h3>
                          <p className="text-sm font-medium text-blue-600 mt-1 flex items-center gap-1">
                            {provider.category_name}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-1.5 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-bold text-yellow-700">
                              {provider.average_rating > 0 || provider.averageRating > 0
                                ? Number(provider.average_rating || provider.averageRating).toFixed(1)
                                : "New"}
                            </span>
                            {(provider.total_reviews > 0 || provider.totalReviews > 0) && (
                              <span className="text-xs font-medium text-yellow-600/70 ml-0.5">
                                ({provider.total_reviews || provider.totalReviews})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
                        {provider.bio || "No description provided. Ready to work!"}
                      </p>

                      {/* 🌟 NEW: Pricing and Location block */}
                      <div className="flex items-center justify-between mt-auto pt-4">
                        {provider.service_area && (
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-50 w-fit px-2.5 py-1 rounded-md border border-gray-100">
                            <MapPin size={12} className="text-gray-400" />
                            {provider.service_area}
                          </div>
                        )}
                        
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Starting at</p>
                          <p className="text-lg font-extrabold text-gray-900">
                            ₹{provider.base_price || provider.basePrice || 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-100 z-10">
                      <Link
                        to={`/customer/provider/${provider.profile_id}`}
                        className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
                      >
                        View Profile & Book
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-12 border-t border-gray-100 pt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-all shadow-sm"
                >
                  Previous
                </button>
                <span className="text-sm font-semibold text-gray-500">
                  Page <span className="text-gray-900">{pagination.currentPage}</span> of{" "}
                  {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-all shadow-sm"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}