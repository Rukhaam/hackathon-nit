import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getCategoriesAPI, getActiveProvidersAPI } from "../../api/exploreApi";

export const fetchCategories = createAsyncThunk(
  "explore/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCategoriesAPI();
      return response.categories;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load categories");
    }
  }
);

// 🌟 Added page parameter and extract both providers and pagination
export const fetchActiveProviders = createAsyncThunk(
  "explore/fetchProviders",
  async ({ categoryId = "", serviceArea = "", page = 1 } = {}, { rejectWithValue }) => {
    try {
      const response = await getActiveProvidersAPI(categoryId, serviceArea, page);
      return { 
        providers: response.providers, 
        pagination: response.pagination // 🌟 Grab the pagination data
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load providers");
    }
  }
);

const exploreSlice = createSlice({
  name: "explore",
  initialState: {
    categories: [],
    providers: [],
    pagination: null, 
    selectedCategoryId: "", 
    isLoading: false,
    error: null,
  },
  reducers: {
    setSelectedCategory: (state, action) => {
      state.selectedCategoryId = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      .addCase(fetchActiveProviders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchActiveProviders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.providers = action.payload.providers;
        state.pagination = action.payload.pagination; 
      })
      .addCase(fetchActiveProviders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { setSelectedCategory } = exploreSlice.actions;
export default exploreSlice.reducer;