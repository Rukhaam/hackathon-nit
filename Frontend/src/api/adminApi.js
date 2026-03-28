import api from "./axiosConfig";

export const getAllProvidersAdminAPI = async () => {
  const response = await api?.get("/providers/admin/all");
  return response.data;
};

export const approveProviderAPI = async (profileId, isApproved) => {
  const response = await api.patch(`/providers/${profileId}/approve`, {
    isApproved,
  });
  return response.data;
};

// Create a new category
export const createCategoryAPI = async (categoryData) => {
  const response = await api.post("/categories", categoryData);
  return response.data;
};

export const deleteCategoryAPI = async (id) => {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
};
export const getAllUsersAPI = async () => {
  const response = await api?.get("/admin/users"); 
  return response.data;
};

export const getAllBookingsAPI = async () => {
  const response = await api?.get("/admin/bookings"); 
  return response.data;
};
export const toggleUserStatusAPI = async (userId, isSuspended) => {
  const response = await api.put(`/admin/users/${userId}/status`, { is_suspended: isSuspended });
  return response.data;
};