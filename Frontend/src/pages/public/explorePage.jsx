import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Search, Star, ArrowRight, MapPin, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchActiveProviders } from "../../redux/slices/exploreSlice";
import { Particles } from "../../components/extras/Particles.jsx"; 
import { RainbowButton } from "../../components/extras/Rainbowbutton.jsx"; 

// --- REUSABLE STAR BORDER COMPONENT (with mobile touch support) ---
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
      className={`relative overflow-hidden rounded-[2rem] group transition-all duration-500 bg-gray-200/50 ${className}`}
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
        style={{ borderRadius: `calc(2rem - ${thickness}px)` }}
      >
        {children}
      </div>
    </Component>
  );
};

export default function ExplorePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    providers,
    pagination,
    isLoading,
  } = useSelector((state) => state.explore);

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // 🌟 Fetch ALL providers by explicitly passing empty filters
    dispatch(
      fetchActiveProviders({
        categoryId: "",
        serviceArea: "",
        page: 1,
      })
    );
  }, [dispatch]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    dispatch(
      fetchActiveProviders({
        categoryId: "",
        serviceArea: "",
        page: newPage,
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12 md:mb-16 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/80 backdrop-blur-xl text-blue-600 rounded-3xl mb-6 shadow-sm border border-white">
            <Users size={32} />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6 drop-shadow-sm">
            Explore All Professionals
          </h1>
          <p className="text-lg md:text-xl text-gray-600 font-medium max-w-2xl mx-auto leading-relaxed">
            Discover our complete network of verified local experts. From emergency plumbers to daily home tutors, find exactly who you need.
          </p>
        </div>

        {/* 🌟 Main Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 p-6 md:p-10 lg:p-12">
            
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between border-b border-gray-200/50 pb-6 mb-10 gap-4">
              <h2 className="text-xl md:text-2xl font-extrabold text-gray-900">
                Network Directory
              </h2>
              {pagination && (
                <span className="text-xs font-extrabold text-blue-700 bg-blue-100/60 border border-blue-200 px-4 py-2 rounded-full uppercase tracking-widest shadow-sm">
                  {pagination.totalCount || providers.length} Professionals Available
                </span>
              )}
            </div>

            {/* Provider Grid */}
            {isLoading ? (
              <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div
                    key={n}
                    className="bg-white/50 backdrop-blur-md rounded-[2rem] h-[400px] border border-white/60 animate-pulse shadow-sm"
                  ></div>
                ))}
              </div>
            ) : providers.length === 0 ? (
              <div className="text-center py-32 bg-white/50 backdrop-blur-md rounded-[2rem] border border-gray-200/50 border-dashed shadow-sm">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto mb-6">
                  <Search className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-2">
                  No professionals found
                </h3>
                <p className="text-gray-500 font-medium text-lg">
                  Our network is currently empty. Check back soon!
                </p>
              </div>
            ) : (
              <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                {providers.map((provider) => (
                  <StarBorder
                    key={provider.profile_id}
                    color="#F59E0B"
                    thickness={2}
                    className="shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/60 hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] data-[active=true]:shadow-[0_20px_40px_rgb(0,0,0,0.12)] hover:-translate-y-1.5 data-[active=true]:-translate-y-1.5 bg-white/40"
                    innerClassName="bg-white/90 backdrop-blur-md px-6 py-8 lg:px-8 lg:py-10 flex flex-col items-center text-center transition-all duration-500 h-full"
                  >
                    {/* Centered Avatar with Overlapping Rating Badge */}
                    <div className="relative mb-6 mt-2">
                      <img
                        src={provider.profile_image || "https://res.cloudinary.com/demo/image/upload/v1580995054/avatar.png"}
                        alt={provider.name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md mx-auto shrink-0"
                      />
                      {/* Floating Rating Badge */}
                      <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-yellow-100 shadow-sm whitespace-nowrap z-10">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-extrabold text-yellow-700">
                          {Number(
                            provider.average_rating || provider.averageRating
                          ).toFixed(1)}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col items-center w-full mt-3">
                      <h3 className="text-xl md:text-2xl font-extrabold text-gray-900 group-hover:text-blue-600 group-data-[active=true]:text-blue-600 transition-colors line-clamp-1 mb-1.5">
                        {provider.name}
                      </h3>
                      
                      <p className="text-[11px] md:text-xs font-extrabold text-blue-600 uppercase tracking-widest mb-5">
                        {provider.category_name}
                      </p>

                      <p className="text-sm md:text-base text-gray-600 font-medium leading-relaxed line-clamp-3 mb-6 text-balance px-2">
                        {provider.bio ||
                          "Highly rated professional ready to provide exceptional service!"}
                      </p>

                      <div className="mt-auto mb-8"> 
                        {provider.service_area && (
                          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 bg-gray-100/80 px-3 py-1.5 rounded-xl border border-gray-200/60">
                            <MapPin size={14} className="text-gray-500" />
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
            )}

            {/* 🌟 Premium Glassmorphic Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-14 border-t border-gray-200/50 pt-8">
                <span className="text-sm font-semibold text-gray-500">
                  Page <span className="font-extrabold text-gray-900">{pagination.currentPage}</span> of{" "}
                  <span className="font-extrabold text-gray-900">{pagination.totalPages}</span>
                </span>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <RainbowButton
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="flex-1 sm:flex-none h-12 px-6 rounded-xl text-sm font-bold shadow-sm disabled:opacity-40 disabled:grayscale"
                  >
                    <ChevronLeft size={18} className="mr-1" /> Previous
                  </RainbowButton>
                  <RainbowButton
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="flex-1 sm:flex-none h-12 px-6 rounded-xl text-sm font-bold shadow-sm disabled:opacity-40 disabled:grayscale"
                  >
                    Next <ChevronRight size={18} className="ml-1" />
                  </RainbowButton>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}