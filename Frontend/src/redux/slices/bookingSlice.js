import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getMyBookingsAPI,
  updateBookingStatusAPI,
  requestBookingAPI,
  completeJobAPI,
  rescheduleBookingAPI,
  updateBookingPriceAPI
} from "../../api/bookingApi";


export const fetchMyBookings = createAsyncThunk(
  "bookings/fetchMyBookings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getMyBookingsAPI();
      return response.bookings;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load bookings");
    }
  }
);

export const rescheduleBooking = createAsyncThunk(
  "bookings/rescheduleBooking",
  async ({ bookingId, newDate }, { rejectWithValue }) => {
    try {
      const data = await rescheduleBookingAPI(bookingId, newDate);
      return { bookingId, newDate, message: data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to reschedule booking");
    }
  }
);

export const updateBookingPrice = createAsyncThunk(
  "bookings/updateBookingPrice",
  async ({ bookingId, newPrice }, { rejectWithValue }) => {
    try {
      const data = await updateBookingPriceAPI(bookingId, newPrice);
      return { bookingId, newPrice, message: data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update price");
    }
  }
);

export const updateBookingStatus = createAsyncThunk(
  "bookings/updateStatus",
  async ({ bookingId, status }, { rejectWithValue }) => {
    try {
      const response = await updateBookingStatusAPI(bookingId, status);
      return { bookingId, status, message: response.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update status");
    }
  }
);

export const completeJob = createAsyncThunk(
  "bookings/completeJob",
  async ({ bookingId, formData }, { rejectWithValue }) => {
    try {
      const response = await completeJobAPI(bookingId, formData);
      return { bookingId, message: response.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to complete job");
    }
  }
);

export const requestBooking = createAsyncThunk(
  "bookings/requestBooking",
  async (bookingData, { rejectWithValue }) => {
    try {
      const response = await requestBookingAPI(bookingData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to request booking");
    }
  }
);


const bookingSlice = createSlice({
  name: "bookings",
  initialState: {
    items: [],
    isLoading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearBookingMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Bookings
      .addCase(fetchMyBookings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchMyBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update Status
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        state.successMessage = action.payload.message;
        const booking = state.items.find((b) => b.id === action.payload.bookingId);
        if (booking) {
          booking.status = action.payload.status;
        }
      })

      // Complete Job
      .addCase(completeJob.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(completeJob.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload.message;
        const booking = state.items.find((b) => b.id === action.payload.bookingId);
        if (booking) {
          booking.status = "Completed";
        }
      })
      .addCase(completeJob.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(updateBookingPrice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBookingPrice.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload.message;
        const booking = state.items.find((b) => b.id === action.payload.bookingId);
        if (booking) {
          booking.price = action.payload.newPrice;
        }
      })
      .addCase(updateBookingPrice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(rescheduleBooking.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(rescheduleBooking.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload.message;
        const booking = state.items.find((b) => b.id === action.payload.bookingId);
        if (booking) {
          booking.scheduled_date = action.payload.newDate;
          booking.scheduledDate = action.payload.newDate;
        }
      })
      .addCase(rescheduleBooking.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Request Booking
      .addCase(requestBooking.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(requestBooking.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(requestBooking.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearBookingMessages } = bookingSlice.actions;
export default bookingSlice.reducer;