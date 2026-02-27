import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
  colorVariants?: any[];
  discount?: number;
  isActive?: boolean;
}

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: string) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

export const useProducts = (adminOnly: boolean = false) => {
  return useQuery({
    queryKey: productKeys.list(adminOnly ? 'admin' : 'public'),
    queryFn: async () => {
      const { data } = await api.get(`/products${adminOnly ? '?adminOnly=true' : ''}`);
      return data as Product[];
    },
  });
};

export const useProduct = (id: string | undefined) => {
  return useQuery({
    queryKey: productKeys.detail(id || ''),
    queryFn: async () => {
      if (!id) throw new Error('Product ID is required');
      const { data } = await api.get(`/products/${id}`);
      return data as Product;
    },
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.post('/products', formData, {
        headers: { 'Content-Type': undefined },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
      const { data } = await api.put(`/products/${id}`, formData, {
        headers: { 'Content-Type': undefined },
      });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.id) });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
};
