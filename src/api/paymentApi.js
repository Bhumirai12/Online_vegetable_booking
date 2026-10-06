import { apiRequest } from "./apiClient";

export const paymentApi = {
  create: (orderId, paymentMethod) =>
    apiRequest("/payments", {
      method: "POST",
      body: { orderId, paymentMethod },
    }),

  verify: (payload) =>
    apiRequest("/payments/verify", {
      method: "POST",
      body: payload,
    }),

  getByOrderId: (orderId) => apiRequest(`/payments/order/${orderId}`),

  getAllForAdmin: () => apiRequest("/payments/admin/all"),
};
