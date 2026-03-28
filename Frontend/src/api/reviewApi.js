import api from './axiosConfig';

// Submit a new review
export const createReviewAPI = async (reviewData) => {
  const response = await api.post('/reviews', reviewData);
  return response.data;
};


export const getProviderReviewsAPI = async (providerId) => {
  const response = await api?.get(`/reviews/provider/${providerId}`);
  return response.data;
};