import api from "./axiosConfig";

export const getMyBookingsAPI = async () => {
  const response = await api?.get("/bookings");
  return response.data;
};

export const updateBookingStatusAPI = async (bookingId, status) => {
  const response = await api.patch(`/bookings/${bookingId}/status`, { status });
  return response.data;
};

export const completeJobAPI = async (bookingId, formData) => {
  const response = await api.patch(
    `/bookings/${bookingId}/complete`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return response.data;
};
export const requestBookingAPI = async (bookingData) => {
  const response = await api.post("/bookings", bookingData);
  return response.data;
};
export const rescheduleBookingAPI = async (bookingId, newDate) => {
  const response = await api.patch(`/bookings/${bookingId}/reschedule`, {
    newDate,
  });
  return response.data;
};

export const updateBookingPriceAPI = async (bookingId, newPrice) => {
  const response = await api.patch(`/bookings/${bookingId}/price`, {
    newPrice,
  });
  return response.data;
};
