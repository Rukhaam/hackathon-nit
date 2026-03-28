import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import bookingReducer from "./slices/bookingSlice";
import providerReducer from "./slices/providerSlice";
import exploreReducer from "./slices/exploreSlice";
import adminReducer from "./slices/adminSlice";
import reviewReducer from "./slices/reviewSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    provider: providerReducer,
    bookings: bookingReducer,
    explore: exploreReducer,
    admin: adminReducer,
    reviews : reviewReducer,
  },
});
