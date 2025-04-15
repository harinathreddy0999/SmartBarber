/**
 * API Service for backend communication
 * This service handles all API calls to the backend server
 */

// Base URL for API requests
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Types
interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

// Generic fetch function with error handling
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  try {
    // Get auth token from localStorage
    const token = localStorage.getItem("authToken");

    // Set default headers
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    return {
      data: response.ok ? data : undefined,
      error: response.ok ? undefined : data.message || "An error occurred",
      status: response.status,
    };
  } catch (error) {
    console.error("API request failed:", error);
    return {
      error: error instanceof Error ? error.message : "Network error",
      status: 500,
    };
  }
}

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    return fetchApi("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },
  register: async (name: string, email: string, password: string) => {
    return fetchApi("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
  },
  getProfile: async () => {
    return fetchApi("/auth/profile");
  },
  updateProfile: async (profileData: any) => {
    return fetchApi("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  },
};

// Booking API
export const bookingApi = {
  getAvailableSlots: async (date: string, barberId?: string) => {
    const queryParams = barberId ? `?barberId=${barberId}` : "";
    return fetchApi(`/bookings/slots/${date}${queryParams}`);
  },
  createBooking: async (bookingData: any) => {
    return fetchApi("/bookings", {
      method: "POST",
      body: JSON.stringify(bookingData),
    });
  },
  getUserBookings: async () => {
    return fetchApi("/bookings/user");
  },
  updateBooking: async (bookingId: string, bookingData: any) => {
    return fetchApi(`/bookings/${bookingId}`, {
      method: "PUT",
      body: JSON.stringify(bookingData),
    });
  },
  cancelBooking: async (bookingId: string) => {
    return fetchApi(`/bookings/${bookingId}`, {
      method: "DELETE",
    });
  },
};

// Barbers/Stylists API
export const barbersApi = {
  getAllBarbers: async () => {
    return fetchApi("/barbers");
  },
  getBarberById: async (barberId: string) => {
    return fetchApi(`/barbers/${barberId}`);
  },
  getBarberReviews: async (barberId: string) => {
    return fetchApi(`/barbers/${barberId}/reviews`);
  },
};

// Services API
export const servicesApi = {
  getAllServices: async () => {
    return fetchApi("/services");
  },
};

// Saved styles API
export const stylesApi = {
  getUserStyles: async () => {
    return fetchApi("/styles/user");
  },
  saveStyle: async (styleData: any) => {
    return fetchApi("/styles", {
      method: "POST",
      body: JSON.stringify(styleData),
    });
  },
  deleteStyle: async (styleId: string) => {
    return fetchApi(`/styles/${styleId}`, {
      method: "DELETE",
    });
  },
};

// Export default object with all APIs
export default {
  auth: authApi,
  booking: bookingApi,
  barbers: barbersApi,
  services: servicesApi,
  styles: stylesApi,
};
