import { apiRequest } from "./apiClient";

export const categoryApi = {
  getAll: () => apiRequest("/categories"),
  getById: (categoryId) => apiRequest(`/categories/${categoryId}`),
  create: (payload) =>
    apiRequest("/categories", { method: "POST", body: payload }),
  update: (categoryId, payload) =>
    apiRequest(`/categories/${categoryId}`, {
      method: "PUT",
      body: payload,
    }),
  remove: (categoryId) =>
    apiRequest(`/categories/${categoryId}`, { method: "DELETE" }),
};
