import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ShieldCheck,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Star,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import {
  fetchCategories,
  fetchActiveProviders,
  setSelectedCategory,
} from "../../redux/slices/exploreSlice";
import { featuresData, getCategoryImage } from "../../utils/homeData";
import { faqs } from "../../utils/faqsData";
import AsyncSelect from "react-select/async";
import { getCategoryIcon } from "../../utils/marqueeData.jsx";
import { aiService } from "../../api/aiApi.js";

import PremiumMarquee from "../../components/extras/slickInfiniteMarquee.jsx";
import TrustedSection from "../../components/extras/trustedSection.jsx";
import DotField from "../../components/extras/Dotfield.jsx";
import Lanyard from "../../components/extras/Lanyard.jsx";

import { Particles } from "../../components/extras/Particles.jsx"; 

// 🌟 Import the Rainbow Button
import { RainbowButton } from "../../components/extras/Rainbowbutton.jsx"; 

let searchTimeout;

// --- REUSABLE STAR BORDER COMPONENT ---
const StarBorder = ({
  as: Component = "div",
  className = "",
  innerClassName = "",
  color = "#3b82f6",
  speed = "6s",
  thickness = 5,
  children,
  ...rest
}) => {
  return (
    <Component
      className={`relative overflow-hidden rounded-[2rem] group transition-all duration-500 bg-gray-200/50 ${className}`}
      style={{
        padding: `${thickness}px`,
        ...rest.style,
      }}
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

export default function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const sliderRef = useRef(null);

  const { categories, providers, isLoading } = useSelector(
    (state) => state.explore
  );

  const [activeFaq, setActiveFaq] = useState(null);
  const [searchArea, setSearchArea] = useState("");
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const [searchMode, setSearchMode] = useState("standard");
  const [aiQuery, setAiQuery] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Mobile Active Ref Logic for standard elements
  const activeRef = useRef(null);

  const handleInteractionStart = (e) => {
    if (activeRef.current && activeRef.current !== e.currentTarget) {
      activeRef.current.setAttribute("data-active", "false");
    }
    e.currentTarget.setAttribute("data-active", "true");
    activeRef.current = e.currentTarget;
  };

  const handleInteractionEnd = (e) => {
    const el = e.currentTarget;
    setTimeout(() => el.setAttribute("data-active", "false"), 300);
  };

  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }
    dispatch(setSelectedCategory(""));
    dispatch(fetchActiveProviders({ page: 1 }));
  }, [dispatch, categories.length]);

  const topProviders = [...providers]
    .sort((a, b) => {
      const ratingA = Number(a.average_rating || a.averageRating) || 0;
      const ratingB = Number(b.average_rating || b.averageRating) || 0;
      return ratingB - ratingA;
    })
    .slice(0, 5);

  const handleSliderScroll = () => {
    if (!sliderRef.current) return;
    const scrollPosition = sliderRef.current.scrollLeft;
    const itemWidth = sliderRef.current.firstChild.offsetWidth + 24;
    const newIndex = Math.round(scrollPosition / itemWidth);
    setActiveSlideIndex(newIndex);
  };

  const scrollSlider = (direction) => {
    if (sliderRef.current) {
      const itemWidth = sliderRef.current.firstChild.offsetWidth + 24;
      sliderRef.current.scrollBy({
        left: direction * itemWidth,
        behavior: "smooth",
      });
    }
  };

  const handleCategoryClick = (categoryId) => {
    dispatch(setSelectedCategory(categoryId));
    navigate("/providers", { state: { categoryId } });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchArea) return;
    navigate("/search", { state: { searchArea } });
  };

  const handleAiSearchSubmit = async (e) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    setIsAiThinking(true);
    try {
      const categoryNames = categories.map((c) => c.name);
      const data = await aiService.parseSearch(aiQuery, categoryNames);
      const aiResult = data.data;
      const matchedCategory = categories.find(
        (c) => c.name === aiResult.categoryName
      );

      if (matchedCategory) {
        dispatch(setSelectedCategory(matchedCategory.id));
      }

      if (aiResult.city) {
        navigate("/search", { state: { searchArea: aiResult.city } });
      } else {
        navigate("/providers", { state: { categoryId: matchedCategory?.id } });
      }
    } catch (error) {
      console.error(error);
      alert("AI is resting right now. Please use the standard search.");
    }
    setIsAiThinking(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa] w-full font-sans selection:bg-blue-100 selection:text-blue-900">
      <style>
        {`
          @keyframes grid-pan {
            0% { background-position: 0 0; }
            100% { background-position: 4rem 4rem; }
          }
          .animate-grid {
            animation: grid-pan 3s linear infinite;
          }
        `}
      </style>

      {/* 🌟 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-[#fafafa] min-h-screen flex flex-col justify-center pt-20">
        <div className="absolute inset-0 z-0 opacity-100 mix-blend-multiply">
          <div style={{ width: "100%", height: "100%", position: "relative" }}>
            <DotField
              dotRadius={2.5}
              dotSpacing={18}
              bulgeStrength={80}
              glowRadius={220}
              sparkle={false}
              waveAmplitude={0}
              cursorRadius={600}
              cursorForce={0.15}
              bulgeOnly
              gradientFrom="#A855F7"
              gradientTo="#B497CF"
              glowColor="#120F17"
            />
          </div>
        </div>

        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-70 animate-grid pointer-events-none"></div>

        <div className="absolute top-0 right-0 w-full sm:w-[80%] md:w-[50%] h-full z-40 pointer-events-none flex justify-end items-start md:items-center overflow-visible">
          <div className=" hidden md:block w-full h-[60vh] md:h-screen pointer-events-auto opacity-90 md:opacity-100 transform origin-top-right scale-[0.65] md:scale-100 -mt-10 md:mt-0">
            <Lanyard transparent={true} />
          </div>
        </div>

        <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center md:items-start text-center md:text-left w-full pointer-events-none">
          <div className="w-full md:w-[60%] lg:w-[55%] pointer-events-auto">
            <div className="animate-fade-in-up opacity-0 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-blue-100/50 shadow-sm text-blue-600 text-xs md:text-sm font-extrabold mb-6 md:mb-8 hover:bg-white transition-colors cursor-default mx-auto md:mx-0">
              <ShieldCheck size={18} />
              <span className="tracking-wide">
                Trusted by 10,000+ local residents
              </span>
            </div>

            <h1 className="animate-fade-in-up delay-100 opacity-0 text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-extrabold text-gray-900 leading-[1.1] tracking-tight drop-shadow-sm">
              Expert local services, <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 drop-shadow-none">
                right at your doorstep.
              </span>
            </h1>

            <p className="animate-fade-in-up delay-200 opacity-0 mt-5 md:mt-6 text-base sm:text-lg md:text-xl font-medium text-gray-500 max-w-xl leading-relaxed mx-auto md:mx-0">
              From emergency plumbing to professional home cleaning. Connect
              with verified local professionals instantly.
            </p>

            <div className="animate-fade-in-up delay-300 opacity-0 mt-10 md:mt-12 w-full max-w-2xl relative z-40 mx-auto md:mx-0">
              <div className="flex items-center justify-center md:justify-start mb-5 md:mb-6">
                <div className="bg-gray-200/60 backdrop-blur-md border border-gray-100 p-1.5 rounded-full flex gap-1 shadow-inner">
                  <button
                    onClick={() => setSearchMode("standard")}
                    className={`text-xs md:text-sm font-bold px-5 md:px-6 py-2 md:py-2.5 rounded-full transition-all duration-300 ${
                      searchMode === "standard"
                        ? "bg-white text-gray-900 shadow-md"
                        : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                    }`}
                  >
                    Location Search
                  </button>
                  <button
                    onClick={() => setSearchMode("ai")}
                    className={`text-xs md:text-sm font-bold px-5 md:px-6 py-2 md:py-2.5 rounded-full transition-all duration-300 flex items-center gap-1.5 md:gap-2 ${
                      searchMode === "ai"
                        ? "bg-purple-600 text-white shadow-[0_4px_14px_rgba(168,85,247,0.3)]"
                        : "text-purple-600 hover:text-purple-700 hover:bg-white/50"
                    }`}
                  >
                    <Sparkles size={16} className="md:w-4 md:h-4" /> AI Assistant
                  </button>
                </div>
              </div>

              {searchMode === "standard" ? (
                <form onSubmit={handleSearchSubmit} className="w-full">
                  <div className="flex flex-col md:flex-row items-center gap-3 md:gap-0 w-full">
                    <div className="flex items-center w-full shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-[1.25rem] md:rounded-full bg-white/90 backdrop-blur-xl border border-gray-200 hover:border-blue-300 transition-all duration-300 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/20 p-1.5 md:p-2">
                      <div className="pl-3 md:pl-5 pr-1 md:pr-2 text-blue-600">
                        <MapPin
                          className="w-5 h-5 md:w-7 md:h-7"
                          strokeWidth={2.5}
                        />
                      </div>

                      <div className="flex-1 text-left">
                        <AsyncSelect
                          cacheOptions
                          loadOptions={(inputValue) => {
                            return new Promise((resolve) => {
                              if (!inputValue || inputValue.length < 3)
                                return resolve([]);
                              clearTimeout(searchTimeout);
                              const GEOAPIFY_API_KEY =
                                import.meta.env.VITE_GEOAPIFY_API_KEY;
                              searchTimeout = setTimeout(async () => {
                                try {
                                  const res = await fetch(
                                    `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
                                      inputValue
                                    )}&type=city&filter=countrycode:in&format=json&apiKey=${GEOAPIFY_API_KEY}`
                                  );
                                  const data = await res.json();
                                  if (data.results) {
                                    const options = data.results.map(
                                      (place) => ({
                                        label: place.state
                                          ? `${place.city}, ${place.state}`
                                          : place.city,
                                        value: place.city,
                                      })
                                    );
                                    const uniqueOptions = Array.from(
                                      new Set(options.map((a) => a.value))
                                    )
                                      ?.map((value) =>
                                        options.find((a) => a.value === value)
                                      )
                                      ?.filter((opt) => opt.value);
                                    resolve(uniqueOptions);
                                  } else {
                                    resolve([]);
                                  }
                                } catch (err) {
                                  resolve([]);
                                }
                              }, 400);
                            });
                          }}
                          onChange={(option) =>
                            setSearchArea(option ? option.value : "")
                          }
                          placeholder="Where do you need service?"
                          noOptionsMessage={() => "Type a city..."}
                          isClearable
                          styles={{
                            control: (provided) => ({
                              ...provided,
                              border: "none",
                              boxShadow: "none",
                              backgroundColor: "transparent",
                              cursor: "text",
                              minHeight: "48px",
                            }),
                            input: (provided) => ({
                              ...provided,
                              fontSize: "1rem",
                              fontWeight: "700",
                              color: "#111827",
                              padding: 0,
                              margin: 0,
                            }),
                            placeholder: (provided) => ({
                              ...provided,
                              fontSize: "1rem",
                              fontWeight: "600",
                              color: "#9ca3af",
                            }),
                            singleValue: (provided) => ({
                              ...provided,
                              fontSize: "1rem",
                              fontWeight: "700",
                              color: "#111827",
                            }),
                            menu: (provided) => ({
                              ...provided,
                              borderRadius: "1.25rem",
                              overflow: "hidden",
                              boxShadow:
                                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                              marginTop: "16px",
                              zIndex: 50,
                              border: "1px solid #f3f4f6",
                            }),
                            option: (provided, state) => ({
                              ...provided,
                              backgroundColor: state.isFocused
                                ? "#eff6ff"
                                : "white",
                              color: state.isFocused ? "#1d4ed8" : "#374151",
                              fontWeight: state.isFocused ? "700" : "600",
                              padding: "14px 20px",
                              cursor: "pointer",
                              transition: "all 0.2s",
                            }),
                          }}
                        />
                      </div>

                      {/* 🌟 Desktop Search Rainbow Button */}
                      <RainbowButton
                        type="submit"
                        className="hidden md:flex h-[56px] w-[140px] text-lg font-extrabold ml-2 rounded-full z-10"
                      >
                        Search
                      </RainbowButton>
                    </div>

                    {/* 🌟 Mobile Search Rainbow Button */}
                    <RainbowButton
                      type="submit"
                      className="md:hidden w-full max-w-[240px] h-12 text-sm font-extrabold mx-auto mt-3 rounded-xl z-10"
                    >
                      Search
                    </RainbowButton>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleAiSearchSubmit} className="w-full">
                  <div className="relative flex flex-col md:flex-row items-center gap-3 md:gap-0 w-full">
                    <div className="flex items-center w-full shadow-[0_12px_40px_-15px_rgba(168,85,247,0.2)] rounded-2xl md:rounded-full bg-white/90 backdrop-blur-xl border-2 border-purple-100 hover:border-purple-300 transition-all duration-300 focus-within:border-purple-500 focus-within:ring-4 focus-within:ring-purple-500/20 p-1.5 md:p-2">
                      <div className="pl-3 md:pl-5 pr-1 md:pr-2 text-purple-600">
                        <Sparkles
                          className={`w-5 h-5 md:w-7 md:h-7 ${
                            isAiThinking ? "animate-spin" : "animate-pulse"
                          }`}
                          strokeWidth={2.5}
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <input
                          type="text"
                          value={aiQuery}
                          onChange={(e) => setAiQuery(e.target.value)}
                          disabled={isAiThinking}
                          placeholder="Describe your issue..."
                          className="w-full min-h-[48px] md:min-h-[56px] bg-transparent border-none outline-none text-base md:text-lg font-bold text-gray-900 placeholder-gray-400 px-2 md:px-3 disabled:opacity-50 relative z-10"
                        />
                      </div>
                      
                      {/* 🌟 Desktop AI Rainbow Button */}
                      <RainbowButton
                        type="submit"
                        disabled={isAiThinking}
                        className="hidden md:flex h-[56px] text-lg font-extrabold px-8 ml-2 rounded-full z-10"
                      >
                        {isAiThinking ? "Thinking..." : "Find Help"}
                      </RainbowButton>
                    </div>

                    {/* 🌟 Mobile AI Rainbow Button */}
                    <RainbowButton
                      type="submit"
                      disabled={isAiThinking}
                      className="md:hidden w-full max-w-[240px] h-12 text-sm font-extrabold mx-auto mt-3 rounded-xl z-10"
                    >
                      {isAiThinking ? "Thinking..." : "Find Help"}
                    </RainbowButton>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 🌟 COMBINED PARTICLES WRAPPER */}
      <div className="relative w-full overflow-hidden bg-[#fafafa]">
        
        <Particles
          className="absolute inset-0 z-0 w-full h-full opacity-60"
          quantity={250} 
          ease={80}
          color="#000000" 
          refresh
        />

        <div className="relative z-10 w-full">

          <main className="flex-1 w-full pb-24">
            
            {/* 3. GLASSMORPHIC FEATURES GRID */}
            <section className="relative overflow-hidden py-24">
              <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob pointer-events-none"></div>
              <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 pointer-events-none"></div>
              <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-emerald-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000 pointer-events-none"></div>

              <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-16 max-w-3xl mx-auto text-center">
                  <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
                    Everything you need to <br className="hidden sm:block" /> get it done.
                  </h2>
                  <p className="text-lg md:text-xl text-gray-600 font-medium leading-relaxed max-w-2xl mx-auto">
                    Powerful features designed to help you find, book, and manage
                    local services smarter and faster. No clutter, just results.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {featuresData.map((feature) => (
                    <StarBorder
                      key={feature.id}
                      color="#A855F7"
                      thickness={2}
                      className="hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] data-[active=true]:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-2 data-[active=true]:-translate-y-2 h-full bg-white/20"
                      innerClassName="flex flex-col items-center text-center p-8 md:p-10 bg-white/60 backdrop-blur-xl hover:bg-white/80 data-[active=true]:bg-white/80 transition-all duration-500 h-full"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 opacity-0 group-hover:opacity-100 group-data-[active=true]:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                      <div className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white shadow-sm border border-gray-100 text-blue-600 font-extrabold text-lg mb-6 tracking-widest group-hover:scale-110 group-data-[active=true]:scale-110 group-hover:text-blue-700 group-data-[active=true]:text-blue-700 transition-all duration-300 z-10">
                        {feature.id}
                      </div>

                      <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4 group-hover:text-blue-700 group-data-[active=true]:text-blue-700 transition-colors duration-300 z-10">
                        {feature.title}
                      </h3>

                      <p className="text-sm md:text-base text-gray-600 font-medium leading-relaxed z-10">
                        {feature.description}
                      </p>
                    </StarBorder>
                  ))}
                </div>
              </div>
            </section>

            {/* 4. VISUAL CATEGORIES SLIDER */}
            <section className="bg-transparent backdrop-blur-md py-20 md:py-24 shadow-sm ">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-6 relative z-10 text-center md:text-left">
                  <div className="max-w-3xl mx-auto md:mx-0">
                    <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4 md:mb-6">
                      Explore Services
                    </h2>
                    <p className="text-base md:text-xl text-gray-600 font-medium">
                      Swipe or use arrows to select a category and view our verified professionals.
                    </p>
                  </div>

                  <div className="hidden md:flex gap-3">
                    {/* 🌟 Slider Rainbow Buttons */}
<button
                      onClick={() => scrollSlider(-1)}
                      className="p-4 rounded-full bg-gray-50 border border-gray-200 shadow-sm text-gray-600 hover:text-blue-600 hover:bg-white hover:border-blue-200 hover:shadow-md transition-all"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={() => scrollSlider(1)}
                      className="p-4 rounded-full bg-gray-50 border border-gray-200 shadow-sm text-gray-600 hover:text-blue-600 hover:bg-white hover:border-blue-200 hover:shadow-md transition-all"
                    >
                      <ChevronRight size={24} />
                    </button>

                    </div>
                </div>

                <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mask-[linear-gradient(to_right,transparent_0%,black_8%,black_80%,transparent_100%)] ">
                  <div
                    ref={sliderRef}
                    onScroll={handleSliderScroll}
                    className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory pb-8 md:pb-12 pt-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth"
                  >
                    {isLoading && categories.length === 0
                      ? [1, 2, 3, 4, 5].map((n) => (
                          <div
                            key={n}
                            className="min-w-[280px] sm:min-w-[340px] h-[360px] md:h-[420px] shrink-0 snap-start bg-gray-100 rounded-[2rem] animate-pulse"
                          ></div>
                        ))
                      : categories.map((category) => (
                          <button
                            key={category.id}
                            onClick={() => handleCategoryClick(category.id)}
                            onTouchStart={handleInteractionStart}
                            onTouchEnd={handleInteractionEnd}
                            onMouseEnter={handleInteractionStart}
                            onMouseLeave={handleInteractionEnd}
                            className={`text-left group relative min-w-[280px] sm:min-w-[340px] h-[360px] md:h-[420px] shrink-0 snap-start rounded-[2rem] overflow-hidden focus:outline-none transition-all duration-500 hover:shadow-2xl data-[active=true]:shadow-2xl hover:-translate-y-2 data-[active=true]:-translate-y-2 shadow-md border border-gray-200`}
                          >
                            <img
                              src={getCategoryImage(category.name)}
                              alt={category.name}
                              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 group-data-[active=true]:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/50 to-transparent opacity-80 group-hover:opacity-90 group-data-[active=true]:opacity-90 transition-opacity duration-300"></div>

                            <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                              <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-2 md:mb-3 group-hover:text-blue-300 group-data-[active=true]:text-blue-300 transition-colors">
                                {category.name}
                              </h3>
                              <p className="text-sm md:text-base text-gray-200 font-medium leading-relaxed line-clamp-2">
                                {category.description}
                              </p>
                            </div>
                          </button>
                        ))}
                    <div className="min-w-[1px] shrink-0"></div>
                  </div>

                  {!isLoading && categories.length > 0 && (
                    <div className="flex items-center justify-center gap-2 mt-2">
                      {categories.map((_, index) => (
                        <div
                          key={index}
                          className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
                            activeSlideIndex === index
                              ? "w-8 md:w-10 bg-blue-600"
                              : "w-2 md:w-2.5 bg-gray-300 hover:bg-gray-400"
                          }`}
                        ></div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* 5. TOP RATED PROVIDERS SECTION */}
            {topProviders.length > 0 && (
              <section className="relative bg-gray-50/60 backdrop-blur-md py-24">
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
                    <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4 md:mb-6">
                      Top Rated Professionals
                    </h2>
                    <p className="text-base md:text-xl text-gray-600 font-medium leading-relaxed">
                      The best of the best. Highly recommended by your local
                      community for exceptional service.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {topProviders.map((provider) => (
                      <StarBorder
                        key={provider.profile_id}
                        color="#F59E0B"
                        thickness={2}
                        className="hover:shadow-2xl data-[active=true]:shadow-2xl hover:-translate-y-1 data-[active=true]:-translate-y-1 bg-white/50"
                        innerClassName="bg-white/80 backdrop-blur-sm p-6 md:p-8 flex flex-col transition-all duration-500 h-full"
                      >
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-5 md:mb-6">
                            <div>
                              <h3 className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-blue-600 group-data-[active=true]:text-blue-600 transition-colors">
                                {provider.name}
                              </h3>
                              <p className="text-sm md:text-base font-semibold text-blue-600 mt-1 flex items-center gap-1">
                                {provider.category_name}
                              </p>
                            </div>

                            <div className="flex items-center gap-1 bg-yellow-50 px-2.5 py-1 md:px-3 md:py-1.5 rounded-xl border border-yellow-100 shadow-sm">
                              <Star className="w-3.5 h-3.5 md:w-4 md:h-4 text-yellow-500 fill-yellow-500" />
                              <span className="text-xs md:text-sm font-extrabold text-yellow-700">
                                {Number(
                                  provider.average_rating || provider.averageRating
                                ).toFixed(1)}
                              </span>
                            </div>
                          </div>

                          <p className="text-sm md:text-base text-gray-600 font-medium leading-relaxed line-clamp-3 mb-5 md:mb-6">
                            {provider.bio ||
                              "Highly rated professional ready to provide exceptional service!"}
                          </p>

                          {provider.service_area && (
                            <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-bold text-black bg-gray-50 w-fit px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg border border-gray-100">
                              <MapPin
                                size={14}
                                className="text-gray-400 md:w-[16px] md:h-[16px]"
                              />
                              {provider.service_area}
                            </div>
                          )}
                        </div>

                        <div className="mt-6 md:mt-8 pt-5 md:pt-6 border-t border-gray-100 z-10">
                          {/* 🌟 View Profile Rainbow Button */}
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
                </div>
              </section>
            )}

          </main>

          <TrustedSection />

          {/* 6. GLASSMORPHIC FAQ SECTION */}
          <section className="relative py-24 md:py-32 bg-gray-50/60 backdrop-blur-md border-t border-gray-200/50">
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 pointer-events-none"></div>
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 pointer-events-none"></div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12 md:mb-16">
                <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4 md:mb-6">
                  Frequently Asked Questions
                </h2>
                <p className="text-base md:text-xl text-gray-600 font-medium max-w-2xl mx-auto">
                  Everything you need to know about how LocalHub works.
                </p>
              </div>

              <div className="space-y-3 md:space-y-4">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    onTouchStart={handleInteractionStart}
                    onTouchEnd={handleInteractionEnd}
                    onMouseEnter={handleInteractionStart}
                    onMouseLeave={handleInteractionEnd}
                    className={`rounded-2xl md:rounded-[1.5rem] overflow-hidden transition-all duration-300 border ${
                      activeFaq === index
                        ? "bg-white/80 backdrop-blur-xl border-blue-200 shadow-lg"
                        : "bg-white/40 backdrop-blur-md border-white/60 shadow-sm hover:bg-white/60 data-[active=true]:bg-white/60 hover:shadow-md data-[active=true]:shadow-md"
                    }`}
                  >
                    <button
                      onClick={() =>
                        setActiveFaq(activeFaq === index ? null : index)
                      }
                      className="w-full text-left px-6 md:px-8 py-5 md:py-6 flex justify-between items-center focus:outline-none"
                    >
                      <span
                        className={`text-base md:text-xl font-bold transition-colors duration-300 ${
                          activeFaq === index ? "text-blue-700" : "text-gray-900"
                        }`}
                      >
                        {faq.q}
                      </span>
                      <div
                        className={`p-1.5 md:p-2 rounded-full transition-colors duration-300 shrink-0 ml-4 ${
                          activeFaq === index ? "bg-blue-100" : "bg-gray-100"
                        }`}
                      >
                        <ChevronDown
                          size={18}
                          className={`md:w-[20px] md:h-[20px] transition-transform duration-500 ease-in-out ${
                            activeFaq === index
                              ? "rotate-180 text-blue-700"
                              : "text-gray-500"
                          }`}
                        />
                      </div>
                    </button>

                    <div
                      className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${
                        activeFaq === index ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="px-6 md:px-8 pb-6 md:pb-8 text-gray-600 text-sm md:text-lg font-medium leading-relaxed">
                          {faq.a}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <PremiumMarquee />
        </div>
      </div>
    </div>
  );
}