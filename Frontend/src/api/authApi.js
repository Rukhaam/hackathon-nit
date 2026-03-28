import api from './axiosConfig';

export const registerUserAPI = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const verifyOtpAPI = async (data) => {
  const response = await api.post('/auth/verify-otp', data);
  return response.data;
};

export const loginUserAPI = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const logoutUserAPI = async () => {
  const response = await api?.get('/auth/logout');
  return response.data;
};

export const forgotPasswordAPI = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};
export const checkAuthAPI = async () => {
    const response = await api?.get('/auth/me');
    return response.data;
  };
export const logoutAPI = async () => {
  const response = await api?.get('/auth/logout'); 
  return response.data;
};export const resetPasswordAPI = async (data) => {

  const response = await api.post('/auth/reset-password', data); 
  return response.data;
};