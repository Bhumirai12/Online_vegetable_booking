import { apiRequest } from "./apiClient";

export const cartApi = {
  getCart: () => apiRequest("/cart"),

  addItem: (vegetableId, quantity = 1) =>
    apiRequest("/cart", {
      method: "POST",
      body: { vegetableId, quantity },
    }),

  updateItem: (cartItemId, quantity) =>
    apiRequest(`/cart/items/${cartItemId}`, {
      method: "PUT",
      body: { quantity },
    }),

  removeItem: (cartItemId) =>
    apiRequest(`/cart/items/${cartItemId}`, {
      method: "DELETE",
    }),

  clear: () => apiRequest("/cart", { method: "DELETE" }),
};
