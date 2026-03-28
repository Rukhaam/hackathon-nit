import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Star, ArrowRight, MapPin, Filter, ArrowLeft, Building2 } from "lucide-react";
import { fetchCategories, fetchActiveProviders } from "../../redux/slices/exploreSlice";

export default function AreaSearchPage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    categories,
    providers,
    pagination,
    isLoading,
  } = useSelector((state) => state.explore);

  // Grab the searched area from the homepage navigation state
  const searchArea = location.state?.searchArea || "";
  
  // Local state for category filtering specifically on this page
  const [localCategoryId, setLocalCategoryId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }

    // Fetch providers based on the city (and optional category filter)
    if (searchArea) {
      dispatch(
        fetchActiveProviders({
          categoryId: localCategoryId,
          serviceArea: searchArea,
          page: 1,
        })
      );
    }
  }, [dispatch, searchArea, localCategoryId]);

  const handleCategoryFilter = (categoryId) => {
    // Toggle off if clicking the same category, otherwise set new one
    const newId = localCategoryId === categoryId ? "" : categoryId;
    setLocalCategoryId(newId);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    dispatch(
      fetchActiveProviders({
        categoryId: localCategoryId,
        serviceArea: searchArea,
        page: newPage,
      })
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#fafafa] w-full font-sans pb-24">
      {/* 🌟 Header Section */}
      <div className="bg-white border-b border-gray-200 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold text-sm mb-6 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Home
          </button>

          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4 flex items-center gap-3">
            <MapPin className="text-blue-600 w-10 h-10 md:w-12 md:h-12" />
            {searchArea ? `Providers in ${searchArea}` : "Location Search"}
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl">
            {searchArea 
              ? "Browse all available service professionals in your selected area. Use the filters below to narrow your search."
              : "Please return to the homepage and enter a valid city or area."}
          </p>
        </div>
      </div>

      {/* 🌟 Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {!searchArea ? (
          <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-gray-200">
            <Building2 className="w-16 h-16 text-blue-200 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900">No Area Provided</h3>
            <p className="text-gray-500 mt-2 max-w-md mx-auto mb-6">
              Please enter a city or area on the homepage to see local providers.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md"
            >
              Go to Search
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 md:p-10">
            
            {/* Filters Area */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-10 gap-6 border-b border-gray-100 pb-8">
              <div className="flex items-center gap-2 min-w-max">
                <Filter className="text-gray-400" size={20} />
                <h2 className="text-xl font-bold text-gray-900">
                  Filter by Category
                </h2>
              </div>

              <div className="flex flex-wrap gap-2 justify-start lg:justify-end">
                <button
                  onClick={() => handleCategoryFilter("")}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all border ${
                    localCategoryId === ""
                      ? "bg-gray-900 text-white border-gray-900 shadow-md"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  All in {searchArea}
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryFilter(cat.id)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all border ${
                      localCategoryId === cat.id
                        ? "bg-blue-600 text-white border-blue-600 shadow-md transform scale-105"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Provider Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="bg-gray-50 rounded-2xl h-64 border border-gray-100 animate-pulse"></div>
                ))}
              </div>
            ) : providers.length === 0 ? (
              <div className="text-center py-24 bg-gray-50 rounded-2xl border border-gray-200 border-dashed">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900">No professionals found</h3>
                <p className="text-gray-500 mt-2">
                  We couldn't find any {localCategoryId ? "specific " : ""}professionals in {searchArea} right now.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {providers.map((provider) => (
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

                        <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-bold text-gray-700">
                            {provider.average_rating > 0 || provider.averageRating > 0
                              ? Number(provider.average_rating || provider.averageRating).toFixed(1)
                              : "New"}
                          </span>
                          {(provider.total_reviews > 0 || provider.totalReviews > 0) && (
                            <span className="text-xs font-medium text-gray-400 ml-0.5">
                              ({provider.total_reviews || provider.totalReviews})
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
                        {provider.bio || "No description provided. Ready to work!"}
                      </p>

                      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-blue-50/50 w-fit px-2.5 py-1 rounded-md border border-blue-100">
                        <MapPin size={12} className="text-blue-600" />
                        Serves: {provider.service_area}
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