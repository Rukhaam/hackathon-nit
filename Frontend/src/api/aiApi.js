import api from './axiosConfig';

export const aiService = {

  generateBio: async (category, experience) => {
    const response = await api.post(
      '/ai/generate-bio',
      { category, experience },

    );
    return response.data;
  },

  // Parse Natural Language Search on Homepage
  parseSearch: async (query, availableCategories) => {
    const response = await api.post(
      '/ai/parse-search',
      { query, availableCategories }
    );
    return response.data;
  },

  // Fetch Fair Price Estimate
  getFairPrice: async (category, city) => {
    const response = await api.post(
      '/ai/fair-price', 
      { category, city }
    );
    return response.data;
  }
};