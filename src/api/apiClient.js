const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

function extractErrorMessage(data, fallback) {
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (typeof data.message === "string") return data.message;

  const validationMessages = Object.values(data).filter(
    (value) => typeof value === "string"
  );

  return validationMessages.length
    ? validationMessages.join(", ")
    : fallback;
}

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export async function apiRequest(
  path,
  { method = "GET", body, auth = true, headers = {} } = {}
) {
  const token = localStorage.getItem("freshbasket_token");

  const requestHeaders = {
    ...headers,
  };

  // Check whether request body is FormData
  const isFormData = body instanceof FormData;

  // For normal JSON requests
  if (body !== undefined && !isFormData) {
    requestHeaders["Content-Type"] = "application/json";
  }

  // Add JWT token
  if (auth && token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: requestHeaders,

    // FormData should be sent directly.
    // Normal objects should be converted to JSON.
    body:
      body !== undefined
        ? isFormData
          ? body
          : JSON.stringify(body)
        : undefined,
  });

  const contentType = response.headers.get("content-type") || "";
  let data = null;

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = text || null;
  }

  if (!response.ok) {
    if (response.status === 401 && auth) {
      window.dispatchEvent(
        new CustomEvent("freshbasket:unauthorized")
      );
    }

    throw new ApiError(
      extractErrorMessage(
        data,
        `Request failed with status ${response.status}`
      ),
      response.status,
      data
    );
  }

  return data;
}