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
  Users,
  Award
} from "lucide-react";
import {
  fetchCategories,
  fetchActiveProviders,
  setSelectedCategory,
} from "../../redux/slices/exploreSlice";
import { faqs } from "../../utils/faqsData";
import AsyncSelect from "react-select/async";
import { getCategoryIcon } from "../../utils/marqueeData.jsx";
import { aboutSliderData } from "../../utils/slideUtil.js";
import { aiService } from "../../api/aiApi.js";

import TrustedSection from "../../components/extras/trustedSection.jsx";
import DotField from "../../components/extras/Dotfield.jsx";
import Lanyard from "../../components/extras/Lanyard.jsx";
import { ScrollMarqueeContainer, ScrollMarquee } from "../../components/extras/ScrollMarquee.jsx";
import { Particles } from "../../components/extras/Particles.jsx"; 
import { RainbowButton } from "../../components/extras/Rainbowbutton.jsx"; 

let searchTimeout;

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
  
  const { categories, providers, isLoading } = useSelector((state) => state.explore);

  const [activeFaq, setActiveFaq] = useState(null);
  const [searchArea, setSearchArea] = useState("");
  const [searchMode, setSearchMode] = useState("standard");
  const [aiQuery, setAiQuery] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  
  const [activeAboutSlide, setActiveAboutSlide] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  
  const activeRef = useRef(null);
  const scrollContainerRef = useRef(null);
// State & Ref for Top Providers Slider
  const providerScrollRef = useRef(null);
  const [activeProviderSlide, setActiveProviderSlide] = useState(0);

  const handleProviderScroll = () => {
    if (!providerScrollRef.current) return;
    const scrollPosition = providerScrollRef.current.scrollLeft;
    // Calculate width of one card + gap (approx 24px)
    const itemWidth = providerScrollRef.current.children[0].offsetWidth + 24; 
    const currentIndex = Math.round(scrollPosition / itemWidth);
    setActiveProviderSlide(currentIndex);
  };

  const scrollProvider = (direction) => {
    if (providerScrollRef.current) {
      const itemWidth = providerScrollRef.current.children[0].offsetWidth + 24;
      providerScrollRef.current.scrollBy({ left: direction * itemWidth, behavior: "smooth" });
    }
  };
  const testimonials = [
    {
      name: "Tyson Quick",
      role: "CEO, Postclick",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      review: "LocalHub creates an ongoing visual and audible experience across our business and enables our employees to feel part of a unified culture and company. It's the plug-and-play solution we needed.",
    },
    {
      name: "Kieran Flanagan",
      role: "VP of Marketing, HubSpot",
      avatar: "https://randomuser.me/api/portraits/men/45.jpg",
      review: "My new daily email habit. Begin writing an email. Get to the second paragraph and think 'what a time suck.' Find a LocalHub expert instead. Feel like 😎.",
    },
    {
      name: "David Okuniev",
      role: "Co-CEO, Typeform",
      avatar: "https://randomuser.me/api/portraits/men/78.jpg",
      review: "LocalHub amplifies my communication with the team like nothing else has. It's a communication tool that should be in every executive's toolbox. The quality of professionals is unmatched.",
    },
    {
      name: "Erica Goodell",
      role: "Customer Success, Pearson",
      avatar: "https://randomuser.me/api/portraits/women/65.jpg",
      review: "My teammates and I love using LocalHub! It has saved us hundreds of hours by creating asynchronous communication with local service experts.",
    },
    {
      name: "Harvey Jones",
      role: "Workplace Collaboration, Atlassian",
      avatar: "https://randomuser.me/api/portraits/men/89.jpg",
      review: "Our staff enthusiastically embraced LocalHub. Asynchronous service communication is essential to our distributed team and this platform delivers exceptionally.",
    },
    {
      name: "Bucky Henry",
      role: "Sales Manager, Intercom",
      avatar: "https://randomuser.me/api/portraits/men/12.jpg",
      review: "I think it's the plug-and-play, intuitive, frictionless nature of LocalHub that allows us to find and coordinate services so quickly and seamlessly.",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveAboutSlide((prev) => (prev + 1) % aboutSliderData.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (categories.length === 0) dispatch(fetchCategories());
    dispatch(setSelectedCategory(""));
    dispatch(fetchActiveProviders({ page: 1 }));
  }, [dispatch, categories.length]);

  const topProviders = [...providers]
    .sort((a, b) => {
      const ratingA = Number(a.average_rating || a.averageRating) || 0;
      const ratingB = Number(b.average_rating || b.averageRating) || 0;
      return ratingB - ratingA;
    })
    .slice(0, 6);

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

  const handleTestimonialScroll = () => {
    if (!scrollContainerRef.current) return;
    const scrollPosition = scrollContainerRef.current.scrollLeft;
    const itemWidth = scrollContainerRef.current.children[0].offsetWidth + 24; 
    const currentIndex = Math.round(scrollPosition / itemWidth);
    setActiveTestimonial(currentIndex);
  };

  const scrollTestimonial = (direction) => {
    if (scrollContainerRef.current) {
      const itemWidth = scrollContainerRef.current.children[0].offsetWidth + 24;
      scrollContainerRef.current.scrollBy({ left: direction * itemWidth, behavior: "smooth" });
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
      const matchedCategory = categories.find((c) => c.name === aiResult.categoryName);

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

      {/* Hero Section */}
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
          <div className="hidden md:block w-full h-[60vh] md:h-screen pointer-events-auto opacity-90 md:opacity-100 transform origin-top-right scale-[0.65] md:scale-100 -mt-10 md:mt-0">
            <Lanyard transparent={true} />
          </div>
        </div>

        <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center md:items-start text-center md:text-left w-full pointer-events-none">
          <div className="w-full md:w-[60%] lg:w-[55%] pointer-events-auto">
            <div className="animate-fade-in-up opacity-0 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-blue-100/50 shadow-sm text-blue-600 text-xs md:text-sm font-extrabold mb-6 md:mb-8 hover:bg-white transition-colors cursor-default mx-auto md:mx-0">
              <ShieldCheck size={18} />
              <span className="tracking-wide">Trusted by 10,000+ local residents</span>
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
                        <MapPin className="w-5 h-5 md:w-7 md:h-7" strokeWidth={2.5} />
                      </div>

                      <div className="flex-1 text-left">
                        <AsyncSelect
                          cacheOptions
                          loadOptions={(inputValue) => {
                            return new Promise((resolve) => {
                              if (!inputValue || inputValue.length < 3) return resolve([]);
                              clearTimeout(searchTimeout);
                              const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;
                              searchTimeout = setTimeout(async () => {
                                try {
                                  const res = await fetch(
                                    `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
                                      inputValue
                                    )}&type=city&filter=countrycode:in&format=json&apiKey=${GEOAPIFY_API_KEY}`
                                  );
                                  const data = await res.json();
                                  if (data.results) {
                                    const options = data.results.map((place) => ({
                                      label: place.state ? `${place.city}, ${place.state}` : place.city,
                                      value: place.city,
                                    }));
                                    const uniqueOptions = Array.from(new Set(options.map((a) => a.value)))
                                      ?.map((value) => options.find((a) => a.value === value))
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
                          onChange={(option) => setSearchArea(option ? option.value : "")}
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
                              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                              marginTop: "16px",
                              zIndex: 50,
                              border: "1px solid #f3f4f6",
                            }),
                            option: (provided, state) => ({
                              ...provided,
                              backgroundColor: state.isFocused ? "#eff6ff" : "white",
                              color: state.isFocused ? "#1d4ed8" : "#374151",
                              fontWeight: state.isFocused ? "700" : "600",
                              padding: "14px 20px",
                              cursor: "pointer",
                              transition: "all 0.2s",
                            }),
                          }}
                        />
                      </div>

                      <RainbowButton
                        type="submit"
                        className="hidden md:flex h-[56px] w-[140px] text-lg font-extrabold ml-2 rounded-full z-10"
                      >
                        Search
                      </RainbowButton>
                    </div>

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
                          className={`w-5 h-5 md:w-7 md:h-7 ${isAiThinking ? "animate-spin" : "animate-pulse"}`}
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
                      
                      <RainbowButton
                        type="submit"
                        disabled={isAiThinking}
                        className="hidden md:flex h-[56px] text-lg font-extrabold px-8 ml-2 rounded-full z-10"
                      >
                        {isAiThinking ? "Thinking..." : "Find Help"}
                      </RainbowButton>
                    </div>

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

      {/* Global Particles Background */}
      <div className="relative w-full overflow-hidden bg-[#fafafa]">
    

        <div className="relative z-10 w-full">
          <main className="flex-1 w-full pb-24">

            {/* About Us Slider */}
            <section className="relative overflow-hidden py-24 md:py-32">
              <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                  
                  <div className="relative w-full h-[500px] sm:h-[600px] lg:h-[800px] rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgb(0,0,0,0.12)]">
                    {aboutSliderData.map((slide, index) => (
                      <img
                        key={slide.id}
                        src={slide.image}
                        alt={slide.mainHeading}
                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out ${
                          activeAboutSlide === index 
                            ? "opacity-100 scale-100 z-10" 
                            : "opacity-0 scale-105 z-0"
                        }`}
                      />
                    ))}
                    
                    <div className="absolute inset-0 z-20 pointer-events-none shadow-[inset_0_0_120px_rgba(0,0,0,0.4)]"></div>
                    <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-b from-black/30 via-transparent to-black/60"></div>
                    <div className="absolute inset-0 z-20 pointer-events-none ring-1 ring-inset ring-white/30 rounded-[2.5rem]"></div>
                    
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/40 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/20 flex gap-3 z-30 shadow-sm">
                      {aboutSliderData.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveAboutSlide(index)}
                          className={`h-2.5 rounded-full transition-all duration-500 ease-out focus:outline-none ${
                            activeAboutSlide === index ? "w-10 bg-white" : "w-2.5 bg-white/50 hover:bg-white/80"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="relative w-full h-[650px] md:h-[600px] lg:h-[750px] flex flex-col justify-center mt-12 md:mt-0">
                    {aboutSliderData.map((slide, index) => (
                      <div
                        key={slide.id}
                        className={`absolute inset-0 flex flex-col justify-center transition-all duration-700 ease-out ${
                          activeAboutSlide === index
                            ? "opacity-100 translate-y-0 z-10 pointer-events-auto"
                            : "opacity-0 translate-y-12 z-0 pointer-events-none"
                        }`}
                      >
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-black tracking-tight mb-8 md:mb-12 leading-[1.1]">
                          {slide.mainHeading}
                        </h2>
                        
                        <div className="space-y-8 md:space-y-10">
                          {slide.subItems.map((item, idx) => (
                            <div key={idx} className="border-l-[3px] border-gray-900 pl-5 md:pl-6">
                              <h4 className="text-xs md:text-sm font-extrabold text-black uppercase tracking-[0.2em] mb-2">
                                {item.title}
                              </h4>
                              <p className="text-base md:text-lg text-gray-500 font-medium leading-relaxed text-balance">
                                {item.description}
                              </p>
                            </div>
                          ))}
                        </div>

                 
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Explore Bento Section */}
            <section className="relative py-20 md:py-32 z-10">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
                  
                  <div className="lg:col-span-5 flex flex-col justify-center">
                    <div className="mb-8 md:mb-10 text-center lg:text-left">
                      <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4 leading-tight">
                        Home services at your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">doorstep</span>
                      </h2>
                      <p className="text-lg text-gray-600 font-medium">
                        Instant access to trusted professionals for all your home needs.
                      </p>
                    </div>

                    <div className="bg-white/60 backdrop-blur-2xl border border-white/80 rounded-[2.5rem] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/60 to-transparent pointer-events-none"></div>

                      <div className="grid grid-cols-3 gap-x-4 gap-y-8 relative z-10">
                        {isLoading && categories.length === 0 ? (
                          [1, 2, 3, 4, 5, 6].map((n) => (
                            <div key={n} className="flex flex-col items-center gap-3 animate-pulse">
                              <div className="w-14 h-14 rounded-2xl bg-gray-200/60"></div>
                              <div className="w-16 h-3 bg-gray-200/60 rounded-full"></div>
                            </div>
                          ))
                        ) : (
                          categories.slice(0, 6).map((category) => (
                            <button
                              key={category.id}
                              onClick={() => handleCategoryClick(category.id)}
                              className="flex flex-col items-center gap-3 group/btn focus:outline-none"
                            >
                              <div className="w-14 h-14 md:w-16 md:h-16 rounded-[1.25rem] bg-white shadow-sm border border-gray-100 flex items-center justify-center text-blue-600 group-hover/btn:-translate-y-1.5 group-hover/btn:shadow-md group-hover/btn:border-blue-200 transition-all duration-300 relative overflow-hidden">
                                <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative z-10 scale-110">
                                  {getCategoryIcon(category.name)}
                                </div>
                              </div>
                              <span className="text-[10px] md:text-xs font-bold text-gray-700 text-center leading-tight group-hover/btn:text-blue-700 transition-colors">
                                {category.name}
                              </span>
                            </button>
                          ))
                        )}
                      </div>

                      <div className="mt-8 pt-6 border-t border-gray-200/50 flex justify-center">
                        <button 
                          onClick={() => navigate('/explore')}
                          className="text-sm font-extrabold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 transition-colors"
                        >
                          Explore all services <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-center lg:justify-start gap-8 mt-8 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-500 border border-yellow-100 shadow-sm">
                          <Star size={20} className="fill-yellow-500" />
                        </div>
                        <div>
                          <p className="text-lg font-extrabold text-gray-900 leading-none">4.8</p>
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Service Rating</p>
                        </div>
                      </div>
                      <div className="w-px h-8 bg-gray-300/50"></div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-100 shadow-sm">
                          <Users size={20} />
                        </div>
                        <div>
                          <p className="text-lg font-extrabold text-gray-900 leading-none">10k+</p>
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Happy Customers</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-7 h-[450px] md:h-[600px] w-full mt-10 lg:mt-0">
                    <div className="grid grid-cols-2 gap-4 md:gap-6 h-full">
                      
                      <div className="relative rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-4 border-white/60 group">
                        <img 
                          src="https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800&auto=format&fit=crop" 
                          alt="Spa Service" 
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
                        <div className="absolute bottom-6 left-6 right-6">
                          <div className="bg-white/30 backdrop-blur-md border border-white/50 w-fit px-3 py-1.5 rounded-xl flex items-center gap-2 text-white shadow-sm">
                            <Award size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">Top Rated Spa</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-rows-2 gap-4 md:gap-6 h-full">
                        <div className="relative rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-4 border-white/60 group">
                          <img 
                            src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800&auto=format&fit=crop" 
                            alt="Cleaning Service" 
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
                          <div className="absolute bottom-5 left-5">
                            <span className="text-white font-extrabold text-lg drop-shadow-md">Deep Cleaning</span>
                          </div>
                        </div>

                        <div className="relative rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-4 border-white/60 group bg-blue-100">
                          <img 
                            src="https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=800&auto=format&fit=crop" 
                            alt="AC Repair" 
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
                          <div className="absolute bottom-5 left-5">
                            <span className="text-white font-extrabold text-lg drop-shadow-md">Appliance Repair</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </section> 

            {/* Scroll Velocity Marquee Section */}
            <section className="relative py-20 border-t border-gray-200/50 bg-white/40 backdrop-blur-md overflow-hidden">
              <ScrollMarqueeContainer>
                <ScrollMarquee baseVelocity={-2} className="py-4">
                  <div className="flex items-center gap-12 px-6">
                    {["EXPERT PLUMBERS", "TOP RATED ELECTRICIANS", "TRUSTED TUTORS", "PROFESSIONAL CLEANERS", "QUICK REPAIRS", "BEAUTY & SALON"].map((text, idx) => (
                      <div key={`row1-${idx}`} className="flex items-center gap-12">
                        <span className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-300 to-gray-400 uppercase tracking-tight">
                          {text}
                        </span>
                        <span className="text-blue-500 text-3xl">✦</span>
                      </div>
                    ))}
                  </div>
                </ScrollMarquee>

                <ScrollMarquee baseVelocity={2} className="py-4">
                  <div className="flex items-center gap-12 px-6">
                    {["LOCAL PROFESSIONALS", "INSTANT BOOKING", "VERIFIED EXPERTS", "SECURE PAYMENTS", "24/7 SUPPORT", "GUARANTEED SATISFACTION"].map((text, idx) => (
                      <div key={`row2-${idx}`} className="flex items-center gap-12">
                        <span className="text-4xl md:text-5xl font-extrabold text-gray-900 uppercase tracking-tight">
                          {text}
                        </span>
                        <span className="text-purple-500 text-3xl">✦</span>
                      </div>
                    ))}
                  </div>
                </ScrollMarquee>
              </ScrollMarqueeContainer>
            </section>

            {/* Top Rated Providers */}
{/* 🌟 TOP RATED PROVIDERS SECTION */}
            <section className="relative py-24 md:py-32 bg-transparent z-10">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <div className="mb-12 md:mb-20 text-center max-w-3xl mx-auto">
                  <div className="inline-flex items-center gap-1.5 bg-yellow-50 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-yellow-100 shadow-sm mb-6">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs md:text-sm font-extrabold text-yellow-700">
                      Community Favorites • Highest Rated
                    </span>
                  </div>
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-5 drop-shadow-sm">
                    Top Rated Professionals
                  </h2>
                  <p className="text-lg md:text-xl text-gray-600 font-medium leading-relaxed">
                    The best of the best. Highly recommended by your local community for exceptional service, reliability, and unmatched expertise.
                  </p>
                </div>

                {/* 🌟 Mobile Controls (Arrows) - Hidden on md+ */}
                <div className="flex justify-end gap-3 mb-6 md:hidden px-2">
                  <button 
                    onClick={() => scrollProvider(-1)}
                    className="w-10 h-10 rounded-full bg-white/60 backdrop-blur-md border border-white/80 shadow-sm flex items-center justify-center text-gray-700 hover:bg-white transition-all active:scale-95"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    onClick={() => scrollProvider(1)}
                    className="w-10 h-10 rounded-full bg-white/60 backdrop-blur-md border border-white/80 shadow-sm flex items-center justify-center text-gray-700 hover:bg-white transition-all active:scale-95"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                {/* 🌟 HYBRID GRID/SLIDER CONTAINER */}
                <div 
                  ref={providerScrollRef}
                  onScroll={handleProviderScroll}
                  className="max-w-6xl mx-auto flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10 overflow-x-auto snap-x snap-mandatory md:snap-none pb-8 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth items-stretch"
                >
                  {topProviders.map((provider) => (
                    <StarBorder
                      key={provider.profile_id}
                      color="#F59E0B"
                      thickness={2}
                      // 🌟 Added mobile width constraints and snap alignment
                      className="w-[85vw] sm:w-[400px] md:w-auto shrink-0 snap-center shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/60 md:hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] md:hover:-translate-y-1.5 bg-white/40"
                      innerClassName="bg-white/90 backdrop-blur-md px-6 py-8 lg:px-8 lg:py-10 flex flex-col items-center text-center transition-all duration-500 h-full"
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
                            {Number(
                              provider.average_rating || provider.averageRating
                            ).toFixed(1)}
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

                        <p className="text-sm md:text-base text-gray-600 font-medium leading-relaxed line-clamp-3 mb-6 text-balance px-2">
                          {provider.bio ||
                            "Highly rated professional ready to provide exceptional service!"}
                        </p>

                        <div className="mt-auto mb-8"> 
                          {provider.service_area && (
                            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 bg-gray-100/80 px-3 py-1.5 rounded-xl border border-gray-200/60">
                              <MapPin
                                size={14}
                                className="text-gray-500"
                              />
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

                {/* 🌟 Mobile Pagination Dots - Hidden on md+ */}
                <div className="flex items-center justify-center gap-2 mt-2 md:hidden">
                  {topProviders.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
                        activeProviderSlide === index
                          ? "w-6 bg-blue-600"
                          : "w-1.5 bg-gray-300"
                      }`}
                    ></div>
                  ))}
                </div>

              </div>
            </section>
          </main>
  
          {/* Reviews Section */}
          <section className="relative overflow-hidden py-24 md:py-32 z-10">
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
              <div className="absolute top-[-10%] right-[-15%] w-[50%] h-[50%] bg-blue-400/10 rounded-full mix-blend-multiply filter blur-[120px] animate-blob"></div>
              <div className="absolute bottom-[-10%] left-[-15%] w-[50%] h-[50%] bg-purple-400/10 rounded-full mix-blend-multiply filter blur-[120px] animate-blob animation-delay-2000"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="mb-12 md:mb-20 text-center max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-1.5 bg-yellow-50 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-yellow-100 shadow-sm mb-6">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-xs md:text-sm font-extrabold text-yellow-700">
                    Trusted by thousands worldwide • 5.0 Average Rating
                  </span>
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-5 drop-shadow-sm">
                  What our clients are saying
                </h2>
                <p className="text-lg md:text-xl text-gray-600 font-medium leading-relaxed">
                  Hear directly from verified users across diverse categories about their exceptional experiences with LocalHub professionals.
                </p>
              </div>

              <div className="flex justify-end gap-3 mb-6 md:hidden px-2">
                <button 
                  onClick={() => scrollTestimonial(-1)}
                  className="w-10 h-10 rounded-full bg-white/60 backdrop-blur-md border border-white/80 shadow-sm flex items-center justify-center text-gray-700 hover:bg-white transition-all active:scale-95"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={() => scrollTestimonial(1)}
                  className="w-10 h-10 rounded-full bg-white/60 backdrop-blur-md border border-white/80 shadow-sm flex items-center justify-center text-gray-700 hover:bg-white transition-all active:scale-95"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              <div 
                ref={scrollContainerRef}
                onScroll={handleTestimonialScroll}
                className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10 overflow-x-auto snap-x snap-mandatory md:snap-none pb-8 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth items-stretch"
              >
                {testimonials.map((testimonial, index) => (
                  <div 
                    key={index} 
                    className="w-[85vw] sm:w-[400px] md:w-auto shrink-0 snap-center group bg-white/60 backdrop-blur-xl border border-white/80 rounded-[2rem] p-8 lg:p-10 flex flex-col justify-between hover:bg-white/80 transition-all duration-300 md:hover:-translate-y-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden"
                  >
                    <div className="absolute top-5 right-5 flex items-center gap-1 z-10 opacity-30 md:group-hover:opacity-100 transition-opacity">
                      {[1,2,3,4,5].map(star => <Star key={star} size={14} className="text-yellow-500 fill-yellow-500" />)}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-4 mb-8">
                        <img 
                          src={testimonial.avatar} 
                          alt={testimonial.name} 
                          className="rounded-full w-14 h-14 md:w-16 md:h-16 object-cover border-4 border-white shadow-md mx-0 shrink-0" 
                        />
                        <div className="flex-col">
                          <h3 className="text-lg md:text-xl font-extrabold text-gray-900 line-clamp-1 mb-0.5">
                            {testimonial.name}
                          </h3>
                          <p className="text-sm font-medium text-blue-600 line-clamp-1 tracking-tight">
                            {testimonial.role}
                          </p>
                        </div>
                      </div>

                      <blockquote className="text-gray-700 text-base md:text-lg leading-relaxed line-clamp-6 italic font-medium relative mb-10 flex-1">
                        <span className="absolute -top-4 -left-3 text-7xl font-extrabold text-gray-200 pointer-events-none opacity-60">"</span>
                        {testimonial.review}
                        <span className="absolute -bottom-10 -right-2 text-7xl font-extrabold text-gray-200 pointer-events-none opacity-60">"</span>
                      </blockquote>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-2 mt-2 md:hidden">
                {testimonials.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
                      activeTestimonial === index
                        ? "w-6 bg-blue-600"
                        : "w-1.5 bg-gray-300"
                    }`}
                  ></div>
                ))}
              </div>

            </div>
          </section>

          <TrustedSection />
          
          {/* FAQ Section */}
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

        </div>
      </div>
    </div>
  );
}