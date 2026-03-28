import api from './axiosConfig';

// Fetch the provider's own profile
export const getProviderProfileAPI = async () => {
  const response = await api?.get('/providers/profile');
  return response.data;
};

// Create or update the profile
export const updateProviderProfileAPI = async (profileData) => {
  const response = await api.post('/providers/profile', profileData);
  return response.data;
};

// Toggle duty status
export const toggleAvailabilityAPI = async (isAvailable) => {
  const response = await api.patch('/providers/availability', { isAvailable });
  return response.data;
};

export const getCategoriesAPI = async () => {
  const response = await api?.get('/categories');
  return response.data;
};