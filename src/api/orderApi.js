import { apiRequest } from "./apiClient";

export const orderApi = {
  placeOrder: (payload) =>
    apiRequest("/orders", { method: "POST", body: payload }),

  getMyOrders: () => apiRequest("/orders"),

  getMyOrderById: (orderId) => apiRequest(`/orders/${orderId}`),

  cancelMyOrder: (orderId) =>
    apiRequest(`/orders/${orderId}/cancel`, { method: "PUT" }),

  getAllForAdmin: () => apiRequest("/orders/admin/all"),

  getByIdForAdmin: (orderId) => apiRequest(`/orders/admin/${orderId}`),

  updateStatus: (orderId, status) =>
    apiRequest(`/orders/admin/${orderId}/status`, {
      method: "PUT",
      body: { status },
    }),
};
