import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createReviewAPI, getProviderReviewsAPI } from "../../api/reviewApi";

export const submitReview = createAsyncThunk(
  "reviews/submitReview",
  async (reviewData, { rejectWithValue }) => {
    try {
      const response = await createReviewAPI(reviewData);
      return response.message;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to submit review"
      );
    }
  }
);

export const fetchProviderReviews = createAsyncThunk(
  "reviews/fetchProviderReviews",
  async (providerId, { rejectWithValue }) => {
    try {
      const response = await getProviderReviewsAPI(providerId);
      return { stats: response.stats, reviews: response.reviews };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load reviews"
      );
    }
  }
);

const reviewSlice = createSlice({
  name: "reviews",
  initialState: {
    providerReviews: [],
    stats: { averageRating: 0, totalReviews: 0 },
    isLoading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearReviewMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Submit Review Cases
      .addCase(submitReview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(submitReview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload;
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Reviews Cases
      .addCase(fetchProviderReviews.fulfilled, (state, action) => {
        state.stats = action.payload.stats;
        state.providerReviews = action.payload.reviews;
      });
  },
});

export const { clearReviewMessages } = reviewSlice.actions;
export default reviewSlice.reducer;
