import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getProviderProfileAPI,
  updateProviderProfileAPI,
  toggleAvailabilityAPI,
  getCategoriesAPI,
} from "../../api/providerApi";

export const fetchProviderData = createAsyncThunk(
  "provider/fetchData",
  async (_, { rejectWithValue }) => {
    try {
      const [profileRes, categoriesRes] = await Promise.all([
        getProviderProfileAPI(),
        getCategoriesAPI(),
      ]);
      return {
        profile: profileRes.profile,
        categories: categoriesRes.categories,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load profile data"
      );
    }
  }
);

export const updateProfile = createAsyncThunk(
  "provider/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await updateProviderProfileAPI(profileData);
      return { profileData, message: response.message };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update profile"
      );
    }
  }
);

export const toggleAvailability = createAsyncThunk(
  "provider/toggleAvailability",
  async (isAvailable, { rejectWithValue }) => {
    try {
      const response = await toggleAvailabilityAPI(isAvailable);
      return { isAvailable, message: response.message };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to toggle status"
      );
    }
  }
);

// 2. THE SLICE
const providerSlice = createSlice({
  name: "provider",
  initialState: {
    profile: null,
    categories: [],
    isLoading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearProviderMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Data Cases
      .addCase(fetchProviderData.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProviderData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload.profile;
        state.categories = action.payload.categories;
      })
      .addCase(fetchProviderData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update Profile Cases
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload.message;
        if (!state.profile) state.profile = {};

        state.profile.category_id = action.payload.profileData.categoryId;
        state.profile.bio = action.payload.profileData.bio;
        state.profile.service_area = action.payload.profileData.serviceArea;
        state.profile.base_price = action.payload.profileData.basePrice;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Toggle Availability Cases
      .addCase(toggleAvailability.fulfilled, (state, action) => {
        state.successMessage = action.payload.message;
        if (state.profile) {
          state.profile.is_available = action.payload.isAvailable ? 1 : 0;
        }
      });
  },
});

export const { clearProviderMessages } = providerSlice.actions;
export default providerSlice.reducer;
