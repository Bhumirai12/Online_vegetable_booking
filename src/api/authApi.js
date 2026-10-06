import { apiRequest } from "./apiClient";

export const authApi = {
  login: (payload) =>
    apiRequest("/users/login", {
      method: "POST",
      body: payload,
      auth: false,
    }),

  register: (payload) =>
    apiRequest("/users/register", {
      method: "POST",
      body: payload,
      auth: false,
    }),

  forgotPassword: (email) =>
    apiRequest("/users/forgot-password", {
      method: "POST",
      body: { email },
      auth: false,
    }),

  resetPassword: (otp, newPassword) =>
    apiRequest("/users/reset-password", {
      method: "POST",
      body: { otp, newPassword },
      auth: false,
    }),

  getProfile: (userId) => apiRequest(`/users/${userId}`),

  updateProfile: (userId, payload) =>
    apiRequest(`/users/${userId}`, {
      method: "PUT",
      body: payload,
    }),

  deleteAccount: (userId) =>
    apiRequest(`/users/${userId}`, {
      method: "DELETE",
    }),
};
