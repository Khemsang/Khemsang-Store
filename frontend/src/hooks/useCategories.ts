import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  isActive: boolean;
}

// Query Keys
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (filters: string) => [...categoryKeys.lists(), filters] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
};

// Fetch all categories
export const useCategories = (adminOnly: boolean = false) => {
  return useQuery({
    queryKey: categoryKeys.list(adminOnly ? 'admin' : 'public'),
    queryFn: async () => {
      const { data } = await api.get(`/categories${adminOnly ? '?adminOnly=true' : ''}`);
      return data as Category[];
    },
  });
};

// Fetch single category
export const useCategory = (id: string | undefined) => {
  return useQuery({
    queryKey: categoryKeys.detail(id || ''),
    queryFn: async () => {
      if (!id) throw new Error('Category ID is required');
      const { data } = await api.get(`/categories/${id}`);
      return data as Category;
    },
    enabled: !!id,
  });
};

// Create category
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.post('/categories', formData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
};

// Update category
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
      const { data } = await api.put(`/categories/${id}`, formData);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(variables.id) });
    },
  });
};

// Delete category
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
};
