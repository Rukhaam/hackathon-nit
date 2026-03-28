import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProviderData,
  updateProfile,
  toggleAvailability,
  clearProviderMessages,
} from "../../redux/slices/providerSlice";
import { useToast } from "../../hooks/toastHook";
import { ShieldCheck, ToggleRight, MapPin, IndianRupee } from "lucide-react";
import AsyncSelect from "react-select/async";

// Global timeout for debouncing
let searchTimeout;

export default function EditProfile() {
  const dispatch = useDispatch();
  const { showSuccess, showError, showLoading, dismissToast } = useToast();

  const { profile, categories, isLoading } = useSelector(
    (state) => state.provider
  );

  const [formData, setFormData] = useState({
    categoryId: "",
    bio: "",
    serviceArea: "",
    basePrice: "",
  });

  const [selectedLocation, setSelectedLocation] = useState(null);

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
        setSelectedLocation({
          label: profile.service_area,
          value: profile.service_area,
        });
      }
    }
  }, [profile]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const loadLocationOptions = (inputValue) => {
    return new Promise((resolve) => {
      if (!inputValue || inputValue.trim().length < 3) {
        resolve([]);
        return;
      }

      clearTimeout(searchTimeout);

      searchTimeout = setTimeout(async () => {
        try {
          // 🌟 FIX: Use import.meta.env for Vite
          const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;

          const response = await fetch(
            `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(inputValue)}&type=city&filter=countrycode:in&format=json&apiKey=${GEOAPIFY_API_KEY}`
          );

          const data = await response.json();

          if (data.results) {
            const options = data.results.map((place) => ({
              label: place.state ? `${place.city}, ${place.state}` : place.city,
              value: place.city,
            }));

            const uniqueOptions = Array.from(
              new Set(options.map((a) => a.value))
            )
              .map((value) => options.find((a) => a.value === value))
              .filter((opt) => opt.value);

            resolve(uniqueOptions);
          } else {
            resolve([]);
          }
        } catch (error) {
          console.error("Error fetching locations:", error);
          resolve([]);
        }
      }, 500);
    });
  };

  const handleLocationChange = (selectedOption) => {
    setSelectedLocation(selectedOption);
    setFormData({
      ...formData,
      serviceArea: selectedOption ? selectedOption.value : "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.serviceArea) {
      showError("Please select a valid Service Area from the dropdown.");
      return;
    }

    const loadingId = showLoading("Saving profile...");
    const res = await dispatch(updateProfile(formData))
      .unwrap()
      .catch(() => ({ error: true }));
    dismissToast(loadingId);

    if (!res.error) showSuccess("Profile updated successfully!");
    else showError("Failed to update profile.");
  };

  const handleToggle = async () => {
    const isCurrentlyAvailable = !!profile?.is_available;
    const loadingId = showLoading("Updating status...");

    const res = await dispatch(toggleAvailability(!isCurrentlyAvailable))
      .unwrap()
      .catch(() => ({ error: true }));
    dismissToast(loadingId);

    if (!res.error)
      showSuccess(
        `You are now ${!isCurrentlyAvailable ? "Online ✅" : "Offline 🛑"}`
      );
    else showError("Failed to update duty status.");
  };

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      padding: "6px",
      borderRadius: "0.75rem",
      borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
      backgroundColor: state.isFocused ? "#ffffff" : "#f9fafb",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(59, 130, 246, 0.5)" : "none",
      "&:hover": { borderColor: "#3b82f6" },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? "#eff6ff" : "white",
      color: "#111827",
      padding: "12px 16px",
      cursor: "pointer",
    }),
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 mt-4 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Provider Profile
        </h1>
        <p className="text-gray-500 mt-2 text-lg">
          Manage your public information and duty status.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex items-center justify-between relative overflow-hidden">
        <div
          className={`absolute left-0 top-0 bottom-0 w-2 transition-colors duration-500 ${profile?.is_available ? "bg-green-500" : "bg-gray-300"}`}
        ></div>
        <div className="pl-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ToggleRight
              className={
                profile?.is_available ? "text-green-500" : "text-gray-400"
              }
            />{" "}
            Duty Status
          </h3>
          <p className="text-sm font-medium text-gray-500 mt-1">
            {profile?.is_available
              ? "You are visible to customers and can receive booking requests."
              : "You are currently hidden from search results."}
          </p>
        </div>
        <button
          onClick={handleToggle}
          disabled={!profile}
          className={`relative inline-flex h-10 w-20 items-center rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 ${profile?.is_available ? "bg-green-500" : "bg-gray-200"}`}
        >
          <span
            className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out ${profile?.is_available ? "translate-x-11" : "translate-x-1"}`}
          />
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-10">
        <div className="mb-8 border-b border-gray-100 pb-6 flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Details</h2>
            <p className="text-gray-500 text-sm font-medium mt-1">
              Complete your profile so Admin can approve you for work.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Primary Service Category
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              disabled={isLoading}
              required
              className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white transition-all disabled:opacity-60 font-medium text-gray-700"
            >
              <option value="" disabled>
                Select your specialty...
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <MapPin size={16} className="text-gray-400" />
              Service Area / City
            </label>
            <AsyncSelect
              cacheOptions
              defaultOptions
              loadOptions={loadLocationOptions}
              value={selectedLocation}
              onChange={handleLocationChange}
              placeholder="Start typing your city or area (e.g. Srinagar)..."
              noOptionsMessage={() => "Type at least 3 characters..."}
              styles={customSelectStyles}
              isDisabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1.5 ml-1">
              Customers will use this exact location to find you.
            </p>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <IndianRupee size={16} className="text-gray-400" />
              Starting / Base Price
            </label>
            <input
              type="number"
              name="basePrice"
              value={formData.basePrice}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="e.g. 500"
              min="0"
              className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white transition-all disabled:opacity-60 font-medium text-gray-700"
              required
            />
            <p className="text-xs text-gray-500 mt-1.5 ml-1">
              This is the estimated starting price shown to customers on your
              public profile.
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              About You (Public Bio)
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              disabled={isLoading}
              rows="5"
              required
              placeholder="Tell customers about your experience..."
              className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-gray-50 focus:bg-white transition-all disabled:opacity-60 text-sm leading-relaxed"
            ></textarea>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full md:w-auto bg-gray-900 text-white font-bold px-10 py-3.5 rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50 shadow-md hover:shadow-lg"
            >
              {isLoading ? "Saving Profile..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
