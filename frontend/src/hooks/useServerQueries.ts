/**
 * useServerQueries.ts
 *
 * React Query hooks for all server data that was previously held in read-only
 * Redux slices (banners, stats, analytics, testimonials) plus categories and
 * orders which had full CRUD slices.
 *
 * Rule of thumb used here:
 *   - React Query  →  server state (fetched, cached, invalidated)
 *   - Redux        →  nothing (all server data migrated)
 *   - Context      →  cross-cutting UI state (auth, cart, theme, toasts)
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, bannersApi, statsApi, testimonialsApi } from "../services/api";

// ─── Query key factories ──────────────────────────────────────────────────────

export const bannerKeys = {
  all:      ["banners"] as const,
  byPos:    (pos?: string) => [...bannerKeys.all, pos ?? "all"] as const,
};

export const statsKeys = {
  all:       ["stats"] as const,
  analytics: ["stats", "analytics"] as const,
};

export const testimonialKeys = {
  all: ["testimonials"] as const,
};

export const categoryKeys = {
  all:    ["categories"] as const,
  list:   (adminOnly?: boolean) =>
    [...categoryKeys.all, adminOnly ? "admin" : "public"] as const,
};

export const adminOrderKeys = {
  all:  ["admin-orders"] as const,
  list: (status?: string) =>
    [...adminOrderKeys.all, status ?? "all"] as const,
};

// ─── Banners ──────────────────────────────────────────────────────────────────

export const useBanners = (position?: string) =>
  useQuery({
    queryKey: bannerKeys.byPos(position),
    queryFn:  () => bannersApi.getAll(position).then((r) => r.data),
    staleTime: 1000 * 60 * 10,
  });

// ─── Stats ────────────────────────────────────────────────────────────────────

export const useStats = () =>
  useQuery({
    queryKey: statsKeys.all,
    queryFn:  () => statsApi.getAll().then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });

export const useAnalytics = () =>
  useQuery({
    queryKey: statsKeys.analytics,
    queryFn:  () => api.get("/stats/analytics").then((r) => r.data),
    staleTime: 1000 * 60 * 2,
  });

// ─── Testimonials ─────────────────────────────────────────────────────────────

export const useTestimonials = () =>
  useQuery({
    queryKey: testimonialKeys.all,
    queryFn:  () => testimonialsApi.getAll().then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });

export const useInvalidateTestimonials = () => {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: testimonialKeys.all });
};

// ─── Categories ───────────────────────────────────────────────────────────────

const fetchCategories = async (adminOnly?: boolean) => {
  const url = adminOnly ? "/categories?adminOnly=true" : "/categories";
  const { data } = await api.get(url);
  return data;
};

export const useCategories = (adminOnly?: boolean) =>
  useQuery({
    queryKey: categoryKeys.list(adminOnly),
    queryFn:  () => fetchCategories(adminOnly),
    staleTime: 1000 * 60 * 10,
  });

export const useCreateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) =>
      api.post("/categories", formData).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.all }),
  });
};

export const useUpdateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      api.put(`/categories/${id}`, formData).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.all }),
  });
};

export const useDeleteCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete(`/categories/${id}`).then(() => id),
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.all }),
  });
};

// ─── Admin orders ─────────────────────────────────────────────────────────────

const fetchAdminOrders = async (status?: string) => {
  const params = status && status !== "all" ? `?status=${status}` : "";
  const { data } = await api.get(`/orders${params}`);
  return Array.isArray(data) ? data : (data.orders ?? []);
};

export const useAdminOrders = (status?: string) =>
  useQuery({
    queryKey: adminOrderKeys.list(status),
    queryFn:  () => fetchAdminOrders(status),
    staleTime: 1000 * 60 * 2,
  });

export const useUpdateAdminOrderStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.put(`/orders/${id}/status`, { orderStatus: status }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminOrderKeys.all }),
  });
};
