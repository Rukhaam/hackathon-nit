import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Star, ArrowRight, MapPin, Filter, ArrowLeft, Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchCategories, fetchActiveProviders } from "../../redux/slices/exploreSlice";
import { Particles } from "../../components/extras/Particles.jsx"; 
import { RainbowButton } from "../../components/extras/Rainbowbutton.jsx"; 

// --- REUSABLE STAR BORDER COMPONENT ---
const StarBorder = ({
  as: Component = "div",
  className = "",
  innerClassName = "",
  color = "#3b82f6",
  speed = "6s",
  thickness = 2,
  children,
  ...rest
}) => {
  const activeRef = useRef(null);

  const handleStart = (e) => {
    if (activeRef.current && activeRef.current !== e.currentTarget) {
      activeRef.current.setAttribute("data-active", "false");
    }
    e.currentTarget.setAttribute("data-active", "true");
    activeRef.current = e.currentTarget;
  };

  const handleEnd = (e) => {
    const el = e.currentTarget;
    setTimeout(() => el.setAttribute("data-active", "false"), 300);
  };

  return (
    <Component
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
      onMouseEnter={handleStart}
      onMouseLeave={handleEnd}
      className={`relative overflow-hidden group transition-all duration-500 bg-gray-200/50 ${className}`}
      style={{ padding: `${thickness}px`, ...rest.style }}
      {...rest}
    >
      <div
        className="absolute z-0 w-[300%] h-[250px] opacity-80 bottom-[-100px] right-[-250%] rounded-full animate-star-movement-bottom pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 20%)`,
          animationDuration: speed,
        }}
      ></div>
      <div
        className="absolute z-0 w-[300%] h-[250px] opacity-80 top-[-100px] left-[-250%] rounded-full animate-star-movement-top pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 20%)`,
          animationDuration: speed,
        }}
      ></div>
      <div
        className={`relative z-10 w-full h-full ${innerClassName}`}
      >
        {children}
      </div>
    </Component>
  );
};

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

    if (searchArea) {
      dispatch(
        fetchActiveProviders({
          categoryId: localCategoryId,
          serviceArea: searchArea,
          page: 1,
          limit: 15,
        })
      );
    }
  }, [dispatch, searchArea, localCategoryId]);

  const handleCategoryFilter = (categoryId) => {
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
        limit: 15,
      })
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen bg-[#fafafa] w-full font-sans pb-24 selection:bg-blue-100 selection:text-blue-900">
      
      {/* 🌟 PREMIUM BACKGROUND ORBS & PARTICLES */}
      <Particles
        className="absolute inset-0 z-0 w-full h-full opacity-60"
        quantity={200} 
        ease={80}
        color="#3b82f6" 
        refresh
      />
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-5%] left-[-10%] w-[50%] h-[50%] bg-blue-400/20 rounded-full mix-blend-multiply filter blur-[120px] animate-blob"></div>
        <div className="absolute bottom-[-5%] right-[-10%] w-[50%] h-[50%] bg-purple-400/20 rounded-full mix-blend-multiply filter blur-[120px] animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 pt-24 md:pt-32">
        {/* 🌟 Glassmorphic Header Section */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-10 md:mb-16 animate-fade-in-up">
          <button 
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold text-sm mb-6 transition-colors bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border border-white shadow-sm"
          >
            <ArrowLeft size={16} /> Back to Home
          </button>
          
          <h1 className="text-3xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-4 md:mb-6 drop-shadow-sm leading-tight flex flex-col md:flex-row items-center justify-center gap-3">
            <MapPin className="text-blue-600 w-10 h-10 md:w-12 md:h-12 hidden md:block" />
            {searchArea ? `Providers in ${searchArea}` : "Location Search"}
          </h1>
          <p className="text-base md:text-xl text-gray-600 font-medium max-w-2xl mx-auto leading-relaxed px-2">
            {searchArea 
              ? "Browse all available service professionals in your selected area. Use the filters below to narrow your search."
              : "Please return to the homepage and enter a valid city or area."}
          </p>
        </div>

        {/* 🌟 Main Content Area */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          {!searchArea ? (
            <div className="text-center py-20 md:py-32 bg-white/50 backdrop-blur-md rounded-[2rem] border border-gray-200/50 border-dashed shadow-sm mx-2">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto mb-4 md:mb-6">
                <Building2 className="w-8 h-8 md:w-10 md:h-10 text-blue-300" />
              </div>
              <h3 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-2">
                No Area Provided
              </h3>
              <p className="text-sm md:text-lg text-gray-500 font-medium max-w-md mx-auto mb-8">
                Please enter a city or area on the homepage to see local providers.
              </p>
              <RainbowButton onClick={() => navigate('/')} className="h-12 px-8 rounded-xl font-bold">
                Go to Search
              </RainbowButton>
            </div>
          ) : (
            <div className="bg-white/40 backdrop-blur-xl rounded-[2rem] md:rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 p-4 md:p-10 lg:p-12">
              
              {/* Filters Area */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 md:mb-10 gap-6 border-b border-gray-200/50 pb-6 md:pb-8">
                <div className="flex items-center gap-2 min-w-max">
                  <Filter className="text-gray-400" size={20} />
                  <h2 className="text-lg md:text-xl font-bold text-gray-900">
                    Filter by Category
                  </h2>
                </div>

                <div className="flex flex-wrap gap-2 justify-start lg:justify-end">
                  <button
                    onClick={() => handleCategoryFilter("")}
                    className={`px-4 py-2 rounded-full text-xs md:text-sm font-bold transition-all shadow-sm ${
                      localCategoryId === ""
                        ? "bg-blue-600 text-white border border-blue-500 shadow-md transform scale-105"
                        : "bg-white/80 backdrop-blur-md text-gray-600 border border-white hover:bg-white"
                    }`}
                  >
                    All Services
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryFilter(cat.id)}
                      className={`px-4 py-2 rounded-full text-xs md:text-sm font-bold transition-all shadow-sm ${
                        localCategoryId === cat.id
                          ? "bg-blue-600 text-white border border-blue-500 shadow-md transform scale-105"
                          : "bg-white/80 backdrop-blur-md text-gray-600 border border-white hover:bg-white"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Provider Grid */}
              {isLoading ? (
                <>
                  {/* Mobile Skeleton */}
                  <div className="grid md:hidden grid-cols-2 gap-3 sm:gap-4">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <div key={n} className="bg-white/50 backdrop-blur-md rounded-2xl h-[280px] border border-white/60 animate-pulse shadow-sm"></div>
                    ))}
                  </div>
                  {/* Desktop Skeleton */}
                  <div className="hidden md:grid max-w-5xl mx-auto grid-cols-2 gap-8 lg:gap-12">
                    {[1, 2, 3, 4].map((n) => (
                      <div key={n} className="bg-white/50 backdrop-blur-md rounded-[2rem] h-[400px] border border-white/60 animate-pulse shadow-sm"></div>
                    ))}
                  </div>
                </>
              ) : providers.length === 0 ? (
                <div className="text-center py-20 md:py-32 bg-white/50 backdrop-blur-md rounded-[2rem] border border-gray-200/50 border-dashed shadow-sm mx-2">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto mb-4 md:mb-6">
                    <Search className="w-8 h-8 md:w-10 md:h-10 text-gray-300" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-2">
                    No professionals found
                  </h3>
                  <p className="text-sm md:text-lg text-gray-500 font-medium">
                    We couldn't find any {localCategoryId ? "specific " : ""}professionals in {searchArea} right now.
                  </p>
                </div>
              ) : (
                <>
                  {/* 🌟 1. MOBILE 2-COLUMN GRID (Highly Compact) */}
                  <div className="grid md:hidden grid-cols-2 gap-3 sm:gap-4">
                    {providers.map((provider) => (
                      <StarBorder
                        key={provider.profile_id}
                        color="#F59E0B"
                        thickness={1.5}
                        className="shadow-sm border border-white/60 bg-white/40 rounded-2xl"
                        innerClassName="bg-white/90 backdrop-blur-md p-3 sm:p-4 flex flex-col items-center text-center transition-all duration-500 h-full rounded-[calc(1rem-1.5px)]"
                      >
                        <div className="relative mb-4 mt-1">
                          <img
                            src={provider.profile_image || "https://res.cloudinary.com/demo/image/upload/v1580995054/avatar.png"}
                            alt={provider.name}
                            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-[3px] border-white shadow-sm mx-auto shrink-0"
                          />
                          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex items-center gap-0.5 bg-white px-1.5 py-0.5 rounded-full border border-yellow-100 shadow-sm whitespace-nowrap z-10">
                            <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />
                            <span className="text-[9px] sm:text-[10px] font-extrabold text-yellow-700">
                              {Number(provider.average_rating || provider.averageRating).toFixed(1)}
                            </span>
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col items-center w-full mt-1">
                          <h3 className="text-sm sm:text-base font-extrabold text-gray-900 line-clamp-1 mb-0.5">
                            {provider.name}
                          </h3>
                          <p className="text-[8px] sm:text-[9px] font-extrabold text-blue-600 uppercase tracking-widest mb-2.5">
                            {provider.category_name}
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-600 font-medium leading-snug line-clamp-2 mb-3 px-1 text-balance">
                            {provider.bio || "Ready to provide exceptional service!"}
                          </p>

                          <div className="mt-auto mb-4"> 
                            {provider.service_area && (
                              <div className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-gray-700 bg-gray-100/80 px-2 py-1 rounded-lg border border-gray-200/60 w-full justify-center">
                                <MapPin size={10} className="text-gray-500 shrink-0" />
                                <span className="line-clamp-1">{provider.service_area}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="w-full pt-3 border-t border-gray-100/80 mt-auto">
                          <RainbowButton 
                            asChild 
                            className="w-full h-9 sm:h-10 rounded-lg text-[11px] sm:text-xs font-bold shadow-sm"
                          >
                            <Link to={`/customer/provider/${provider.profile_id}`}>
                              View Profile
                            </Link>
                          </RainbowButton>
                        </div>
                      </StarBorder>
                    ))}
                  </div>

                  {/* 🌟 2. DESKTOP 2-COLUMN GRID (Spacious & Premium) */}
                  <div className="hidden md:grid max-w-5xl mx-auto grid-cols-2 gap-8 lg:gap-12">
                    {providers.map((provider) => (
                      <StarBorder
                        key={provider.profile_id}
                        color="#F59E0B"
                        thickness={2}
                        className="shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/60 hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] hover:-translate-y-1.5 bg-white/40 rounded-[2rem]"
                        innerClassName="bg-white/90 backdrop-blur-md px-6 py-8 lg:px-10 lg:py-12 flex flex-col items-center text-center transition-all duration-500 h-full rounded-[calc(2rem-2px)]"
                      >
                        <div className="relative mb-6 mt-2">
                          <img
                            src={provider.profile_image || "https://res.cloudinary.com/demo/image/upload/v1580995054/avatar.png"}
                            alt={provider.name}
                            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md mx-auto shrink-0"
                          />
                          <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-yellow-100 shadow-sm whitespace-nowrap z-10">
                            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                            <span className="text-xs font-extrabold text-yellow-700">
                              {Number(provider.average_rating || provider.averageRating).toFixed(1)}
                            </span>
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col items-center w-full mt-3">
                          <h3 className="text-xl md:text-2xl font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-1.5">
                            {provider.name}
                          </h3>
                          <p className="text-[11px] md:text-xs font-extrabold text-blue-600 uppercase tracking-widest mb-5">
                            {provider.category_name}
                          </p>
                          <p className="text-sm md:text-base text-gray-600 font-medium leading-relaxed line-clamp-3 mb-6 text-balance px-4">
                            {provider.bio || "Highly rated professional ready to provide exceptional service!"}
                          </p>

                          <div className="mt-auto mb-8"> 
                            {provider.service_area && (
                              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 bg-gray-100/80 px-4 py-2 rounded-xl border border-gray-200/60">
                                <MapPin size={16} className="text-gray-500" />
                                {provider.service_area}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="w-full pt-6 border-t border-gray-100/80 mt-auto">
                          <RainbowButton 
                            asChild 
                            className="w-full h-12 md:h-14 rounded-xl text-sm md:text-base font-bold shadow-sm"
                          >
                            <Link to={`/customer/provider/${provider.profile_id}`}>
                              View Profile
                              <ArrowRight size={16} className="md:w-[18px] md:h-[18px] ml-2" />
                            </Link>
                          </RainbowButton>
                        </div>
                      </StarBorder>
                    ))}
                  </div>
                </>
              )}

              {/* Pagination Controls */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-5 md:gap-6 mt-10 md:mt-14 border-t border-gray-200/50 pt-6 md:pt-8">
                  <span className="text-xs md:text-sm font-semibold text-gray-500 order-2 sm:order-1">
                    Page <span className="font-extrabold text-gray-900">{pagination.currentPage}</span> of{" "}
                    <span className="font-extrabold text-gray-900">{pagination.totalPages}</span>
                  </span>
                  <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto order-1 sm:order-2">
                    <RainbowButton
                      variant="outline"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!pagination.hasPrevPage}
                      className="flex-1 sm:flex-none h-10 md:h-12 px-4 md:px-6 rounded-xl text-xs md:text-sm font-bold shadow-sm disabled:opacity-40 disabled:grayscale"
                    >
                      <ChevronLeft size={16} className="mr-1" /> Prev
                    </RainbowButton>
                    <RainbowButton
                      variant="outline"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                      className="flex-1 sm:flex-none h-10 md:h-12 px-4 md:px-6 rounded-xl text-xs md:text-sm font-bold shadow-sm disabled:opacity-40 disabled:grayscale"
                    >
                      Next <ChevronRight size={16} className="ml-1" />
                    </RainbowButton>
                  </div>
                </div>
              )}
              
            </div>
          )}
        </div>
      </div>
    </div>
  );
}