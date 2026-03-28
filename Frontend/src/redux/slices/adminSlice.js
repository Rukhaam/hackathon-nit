import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllProvidersAdminAPI,
  approveProviderAPI,
  createCategoryAPI,
  toggleUserStatusAPI,
  deleteCategoryAPI,
  getAllUsersAPI,
  getAllBookingsAPI,
} from "../../api/adminApi";
import { fetchCategories } from "./exploreSlice";

export const fetchAllProviders = createAsyncThunk(
  "admin/fetchAllProviders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllProvidersAdminAPI();
      return response.providers;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load providers"
      );
    }
  }
);
export const toggleUserStatus = createAsyncThunk(
  "admin/toggleUserStatus",
  async ({ userId, isSuspended }, { rejectWithValue }) => {
    try {
      const response = await toggleUserStatusAPI(userId, isSuspended);
      return { userId, isSuspended, message: response.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update user status");
    }
  }
);
export const toggleProviderApproval = createAsyncThunk(
  "admin/toggleApproval",
  async ({ profileId, isApproved }, { rejectWithValue }) => {
    try {
      const response = await approveProviderAPI(profileId, isApproved);
      return { profileId, isApproved, message: response.message };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update approval"
      );
    }
  }
);

export const createCategory = createAsyncThunk(
  "admin/createCategory",
  async (categoryData, { dispatch, rejectWithValue }) => {
    try {
      const response = await createCategoryAPI(categoryData);
      dispatch(fetchCategories());
      return response.message;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create category"
      );
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "admin/deleteCategory",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await deleteCategoryAPI(id);
      dispatch(fetchCategories());
      return response.message;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete category"
      );
    }
  }
);

export const fetchAllUsers = createAsyncThunk(
  "admin/fetchAllUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllUsersAPI();
      return response.users || response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load users"
      );
    }
  }
);

export const fetchAllBookings = createAsyncThunk(
  "admin/fetchAllBookings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllBookingsAPI();
      return response.bookings || response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load bookings"
      );
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    providers: [],
    users: [],
    allBookings: [],
    isLoading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearAdminMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Providers
      .addCase(fetchAllProviders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllProviders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.providers = action.payload;
      })
      .addCase(toggleProviderApproval.fulfilled, (state, action) => {
        state.successMessage = action.payload.message;
        const index = state.providers.findIndex(
          (p) => p.profile_id === action.payload.profileId
        );
        if (index !== -1) {
          state.providers[index].is_approved = action.payload.isApproved
            ? 1
            : 0;
        }
      })
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        const { userId, isSuspended } = action.payload;
        const user = state.users.find(u => u.id === userId);
        if (user) {
          user.is_suspended = isSuspended;
        }
      })
      // Categories
      .addCase(createCategory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload;
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.successMessage = action.payload;
      })
      .addCase(fetchAllUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchAllBookings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allBookings = action.payload;
      })
      .addCase(fetchAllBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAdminMessages } = adminSlice.actions;
export default adminSlice.reducer;
