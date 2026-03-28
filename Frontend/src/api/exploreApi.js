import api from "./axiosConfig";

export const getCategoriesAPI = async () => {
  const response = await api.get("/categories");
  return response.data;
};

export const getActiveProvidersAPI = async (
  categoryId = "",
  serviceArea = "",
  page = 1
) => {
  const params = new URLSearchParams();

  if (categoryId) params.append("categoryId", categoryId);
  if (serviceArea) params.append("serviceArea", serviceArea);
  params.append("page", page);
  params.append("limit", 9);

  const queryString = params.toString();

  const url = `/providers?${queryString}`;

  const response = await api.get(url);
  return response.data;
};
