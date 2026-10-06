import { apiRequest } from "./apiClient";

export const vegetableApi = {
  getAll: () => apiRequest("/vegetables"),

  getById: (vegetableId) =>
    apiRequest(`/vegetables/${vegetableId}`),

  getByCategory: (categoryId) =>
    apiRequest(`/vegetables/category/${categoryId}`),

  create: (payload) =>
    apiRequest("/vegetables", {
      method: "POST",
      body: payload,
    }),

  update: (vegetableId, payload) =>
    apiRequest(`/vegetables/${vegetableId}`, {
      method: "PUT",
      body: payload,
    }),

  remove: (vegetableId) =>
    apiRequest(`/vegetables/${vegetableId}`, {
      method: "DELETE",
    }),

  uploadImage: (imageFile) => {
    const formData = new FormData();

    formData.append("image", imageFile);

    return apiRequest("/vegetables/upload-image", {
      method: "POST",
      body: formData,
    });
  },
};