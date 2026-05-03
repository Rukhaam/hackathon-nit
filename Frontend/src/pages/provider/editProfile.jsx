import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProviderData,
  updateProfile,
  toggleAvailability,
  clearProviderMessages,
} from "../../redux/slices/providerSlice";
import { useToast } from "../../hooks/toastHook";
import { ShieldCheck, ToggleRight, MapPin, IndianRupee, Sparkles } from "lucide-react";
import AsyncSelect from "react-select/async";
import { aiService } from "../../api/aiApi"; 

let searchTimeout;

export default function EditProfile() {
  const dispatch = useDispatch();
  const { showSuccess, showError, showLoading, dismissToast } = useToast();

  const { profile, categories, isLoading } = useSelector((state) => state.provider);

  const [formData, setFormData] = useState({
    categoryId: "",
    bio: "",
    serviceArea: "",
    basePrice: "",
  });

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    dispatch(fetchProviderData());
    return () => dispatch(clearProviderMessages());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setFormData({
        categoryId: profile.category_id || "",
        bio: profile.bio || "",
        serviceArea: profile.service_area || "",
        basePrice: profile.base_price || "",
      });
      if (profile.service_area) {
        setSelectedLocation({ label: profile.service_area, value: profile.service_area });
      }
    }
  }, [profile]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMagicWrite = async () => {
    if (!formData.categoryId) {
      showError("Please select a Primary Service Category first.");
      return;
    }
    const selectedCategory = categories.find(c => String(c.id) === String(formData.categoryId));
    
    setGenerating(true);
    try {
      const data = await aiService.generateBio(selectedCategory?.name || "Professional", "several");
      setFormData({ ...formData, bio: data.bio }); 
      showSuccess("Magic Bio generated successfully! ✨");
    } catch (error) {
      console.error(error);
      showError("AI is resting right now. Please try again later.");
    }
    setGenerating(false);
  };

  const loadLocationOptions = (inputValue) => {
    return new Promise((resolve) => {
      if (!inputValue || inputValue.trim().length < 3) return resolve([]);
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(async () => {
        try {
          const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;
          const response = await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(inputValue)}&type=city&filter=countrycode:in&format=json&apiKey=${GEOAPIFY_API_KEY}`);
          const data = await response.json();
          if (data.results) {
            const options = data.results.map((place) => ({
              label: place.state ? `${place.city}, ${place.state}` : place.city,
              value: place.city,
            }));
            const uniqueOptions = Array.from(new Set(options.map((a) => a.value)))
              .map((value) => options.find((a) => a.value === value))
              .filter((opt) => opt.value);
            resolve(uniqueOptions);
          } else {
            resolve([]);
          }
        } catch (error) {
          resolve([]);
        }
      }, 500);
    });
  };

  const handleLocationChange = (selectedOption) => {
    setSelectedLocation(selectedOption);
    setFormData({ ...formData, serviceArea: selectedOption ? selectedOption.value : "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.serviceArea) {
      showError("Please select a valid Service Area from the dropdown.");
      return;
    }
    const loadingId = showLoading("Saving profile...");
    const res = await dispatch(updateProfile(formData)).unwrap().catch(() => ({ error: true }));
    dismissToast(loadingId);
    if (!res.error) showSuccess("Profile updated successfully!");
    else showError("Failed to update profile.");
  };

  const handleToggle = async () => {
    const isCurrentlyAvailable = !!profile?.is_available;
    const loadingId = showLoading("Updating status...");
    const res = await dispatch(toggleAvailability(!isCurrentlyAvailable)).unwrap().catch(() => ({ error: true }));
    dismissToast(loadingId);
    if (!res.error) showSuccess(`You are now ${!isCurrentlyAvailable ? "Online ✅" : "Offline 🛑"}`);
    else showError("Failed to update duty status.");
  };

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      padding: "2px 4px",
      borderRadius: "0.75rem",
      borderColor: state.isFocused ? "#3b82f6" : "rgba(255,255,255,0.6)",
      backgroundColor: state.isFocused ? "#ffffff" : "rgba(255,255,255,0.5)",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(59, 130, 246, 0.3)" : "none",
      "&:hover": { borderColor: "#3b82f6" },
      fontSize: "0.875rem",
      fontWeight: "600",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? "#eff6ff" : "white",
      color: "#111827",
      padding: "10px 16px",
      cursor: "pointer",
      fontSize: "0.875rem",
      fontWeight: "600"
    }),
  };

  return (
    <div className="relative min-h-screen">
      {/* Glassmorphic Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[10%] right-[-10%] w-[50%] h-[50%] bg-blue-400/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob"></div>
        <div className="absolute bottom-[10%] left-[-10%] w-[50%] h-[50%] bg-purple-400/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-3xl mx-auto space-y-6 pt-24 md:pt-28 px-4 sm:px-6 pb-24 md:pb-12 relative z-10">
        <div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Provider Profile</h1>
          <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-lg font-medium">Manage your public information and duty status.</p>
        </div>

        {/* DUTY STATUS CARD */}
        <div className="bg-white/60 backdrop-blur-xl rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-white/60 p-5 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden hover:bg-white/80 transition-colors">
          <div className={`absolute left-0 top-0 bottom-0 w-2 transition-colors duration-500 ${profile?.is_available ? "bg-green-500" : "bg-gray-300"}`}></div>
          <div className="pl-2 md:pl-4">
            <h3 className="text-lg md:text-xl font-extrabold text-gray-900 flex items-center gap-2">
              <ToggleRight className={profile?.is_available ? "text-green-500" : "text-gray-400"} size={22} /> Duty Status
            </h3>
            <p className="text-xs md:text-sm font-medium text-gray-600 mt-1 leading-relaxed max-w-sm">
              {profile?.is_available ? "You are visible to customers and can receive booking requests." : "You are currently hidden from search results."}
            </p>
          </div>
          <button
            onClick={handleToggle}
            disabled={!profile || isLoading}
            className={`relative inline-flex h-8 w-16 md:h-10 md:w-20 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 ${profile?.is_available ? "bg-green-500" : "bg-gray-300"}`}
          >
            <span className={`inline-block h-6 w-6 md:h-8 md:w-8 transform rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out ${profile?.is_available ? "translate-x-9 md:translate-x-11" : "translate-x-1"}`} />
          </button>
        </div>

        {/* EDIT FORM CARD */}
        <div className="bg-white/60 backdrop-blur-xl rounded-[1.5rem] md:rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 p-5 md:p-10">
          <div className="mb-6 md:mb-8 border-b border-gray-200/50 pb-5 md:pb-6 flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600 border border-blue-500/20 shadow-sm">
              <ShieldCheck size={20} className="md:w-[24px] md:h-[24px]" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold text-gray-900">Edit Details</h2>
              <p className="text-gray-500 text-xs md:text-sm font-medium mt-0.5">Complete your profile so Admin can approve you.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            <div>
              <label className="block text-xs md:text-sm font-extrabold text-gray-700 uppercase tracking-widest mb-2">Primary Service Category</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                disabled={isLoading}
                required
                className="w-full px-4 py-3 md:py-3.5 border border-white/60 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white/50 focus:bg-white transition-all disabled:opacity-60 font-bold text-gray-900 text-sm md:text-base shadow-sm"
              >
                <option value="" disabled>Select your specialty...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs md:text-sm font-extrabold text-gray-700 uppercase tracking-widest mb-2">
                <MapPin size={14} className="text-gray-400" /> Service Area / City
              </label>
              <AsyncSelect
                cacheOptions
                defaultOptions
                loadOptions={loadLocationOptions}
                value={selectedLocation}
                onChange={handleLocationChange}
                placeholder="Start typing your city..."
                noOptionsMessage={() => "Type at least 3 characters..."}
                styles={customSelectStyles}
                isDisabled={isLoading}
              />
              <p className="text-[10px] md:text-xs text-gray-500 mt-1.5 font-medium ml-1">Customers will use this exact location to find you.</p>
            </div>
            
            <div>
              <label className="flex items-center gap-1.5 text-xs md:text-sm font-extrabold text-gray-700 uppercase tracking-widest mb-2">
                <IndianRupee size={14} className="text-gray-400" /> Starting / Base Price
              </label>
              <input
                type="number"
                name="basePrice"
                value={formData.basePrice}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="e.g. 500"
                min="0"
                className="w-full px-4 py-3 md:py-3.5 border border-white/60 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white/50 focus:bg-white transition-all disabled:opacity-60 font-bold text-gray-900 text-sm md:text-base shadow-sm"
                required
              />
              <p className="text-[10px] md:text-xs text-gray-500 mt-1.5 font-medium ml-1">This is the estimated starting price shown on your public profile.</p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs md:text-sm font-extrabold text-gray-700 uppercase tracking-widest">About You (Public Bio)</label>
                <button 
                  type="button" 
                  onClick={handleMagicWrite}
                  disabled={generating || isLoading}
                  className="text-[10px] md:text-xs font-bold text-purple-700 bg-white border border-purple-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-purple-50 transition-colors disabled:opacity-50 shadow-sm active:scale-95"
                >
                  <Sparkles size={12} className={generating ? "animate-pulse" : ""} /> 
                  {generating ? "Writing..." : "Magic Write"}
                </button>
              </div>
              
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                disabled={isLoading || generating}
                rows="5"
                required
                placeholder="Tell customers about your experience..."
                className={`w-full px-4 py-3 md:py-4 border rounded-xl focus:ring-2 outline-none resize-none transition-all disabled:opacity-60 font-medium text-xs md:text-sm leading-relaxed shadow-sm ${
                  generating 
                    ? "border-purple-300 bg-purple-50/50 ring-2 ring-purple-100 animate-pulse text-purple-900" 
                    : "border-white/60 bg-white/50 focus:bg-white focus:ring-blue-500 text-gray-900"
                }`}
              ></textarea>
            </div>

            <div className="pt-2 md:pt-4">
              <button
                type="submit"
                disabled={isLoading || generating}
                className="w-full bg-gray-900 text-white font-bold text-sm md:text-base px-6 py-3.5 md:py-4 rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl active:scale-[0.98]"
              >
                {isLoading ? "Saving Profile..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}