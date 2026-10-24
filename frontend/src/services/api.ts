import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url: string = error.config?.url || "";
    const currentPath = window.location.pathname;

    // Never redirect for auth endpoints — avoids infinite loops and
    // false "session expired" toasts on fresh loads (e.g. after email verify)
    const isAuthEndpoint = url.includes("/auth/");

    // Also never redirect if we're already on the login page
    const isLoginPage = currentPath === "/login";

    if (error.response?.status === 401 && !isAuthEndpoint && !isLoginPage) {
      const sessionExpired = error.response?.data?.sessionExpired;

      if (sessionExpired) {
        localStorage.removeItem("user");
        // Only redirect if the user had an actual session (i.e. there was a
        // token cookie present). A fresh load with no cookie should silently
        // fail, not show a "session expired" toast.
        const hadToken = document.cookie.includes("token=");
        if (hadToken) {
          sessionStorage.setItem("redirectAfterLogin", currentPath);
          window.location.href = "/login?session=expired";
        }
      }
      // Don't redirect for regular 401s — let each component handle it
    }
    return Promise.reject(error);
  }
);

// Testimonials API
export const testimonialsApi = {
  getAll: () => api.get("/testimonials"),
  getById: (id: string) => api.get(`/testimonials/${id}`),
  create: (data: any) => api.post("/testimonials", data),
  update: (id: string, data: any) => api.put(`/testimonials/${id}`, data),
  delete: (id: string) => api.delete(`/testimonials/${id}`),
};

// Categories API
export const categoriesApi = {
  getAll: () => api.get("/categories"),
  getById: (id: string) => api.get(`/categories/${id}`),
  create: (data: any) => api.post("/categories", data),
  update: (id: string, data: any) => api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

// Featured Products API
export const featuredProductsApi = {
  getAll: () => api.get("/featured-products"),
  getById: (id: string) => api.get(`/featured-products/${id}`),
  create: (data: any) => api.post("/featured-products", data),
  update: (id: string, data: any) => api.put(`/featured-products/${id}`, data),
  delete: (id: string) => api.delete(`/featured-products/${id}`),
};

// Banners API
export const bannersApi = {
  getAll: (position?: string, admin?: boolean) =>
    api.get("/banners", {
      params: { position, admin: admin ? "true" : undefined },
    }),
  getById: (id: string) => api.get(`/banners/${id}`),
  create: (data: any) => api.post("/banners", data),
  update: (id: string, data: any) => api.put(`/banners/${id}`, data),
  delete: (id: string) => api.delete(`/banners/${id}`),
};

// Stats API
export const statsApi = {
  getAll: () => api.get("/stats"),
  getById: (id: string) => api.get(`/stats/${id}`),
  create: (data: any) => api.post("/stats", data),
  update: (id: string, data: any) => api.put(`/stats/${id}`, data),
  delete: (id: string) => api.delete(`/stats/${id}`),
};

// Contact API
export const contactApi = {
  getSettings: () => api.get("/contact/settings"),
  updateSettings: (data: any) => api.put("/contact/settings", data),
  submitMessage: (data: any) => api.post("/contact/message", data),
  getAllMessages: () => api.get("/contact/messages"),
  updateMessageStatus: (id: string, status: string) =>
    api.put(`/contact/messages/${id}`, { status }),
  deleteMessage: (id: string) => api.delete(`/contact/messages/${id}`),
};

// Features API
export const featuresApi = {
  getAll: (admin?: boolean) =>
    api.get("/features", { params: { admin: admin ? "true" : undefined } }),
  getById: (id: string) => api.get(`/features/${id}`),
  create: (data: any) => api.post("/features", data),
  update: (id: string, data: any) => api.put(`/features/${id}`, data),
  delete: (id: string) => api.delete(`/features/${id}`),
};
