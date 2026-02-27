import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { productKeys } from './useProducts';

interface ColorVariant {
  _id: string;
  colorName: string;
  colorCode: string;
  images: string[];
  stock: number;
  price?: number;
  sku?: string;
  isActive: boolean;
}

// Query Keys
export const variantKeys = {
  all: ['variants'] as const,
  lists: () => [...variantKeys.all, 'list'] as const,
  list: (productId: string) => [...variantKeys.lists(), productId] as const,
};

// Fetch variants for a product
export const useVariants = (productId: string | undefined) => {
  return useQuery({
    queryKey: variantKeys.list(productId || ''),
    queryFn: async () => {
      if (!productId) throw new Error('Product ID is required');
      const { data } = await api.get(`/variants/${productId}`);
      return data as ColorVariant[];
    },
    enabled: !!productId,
  });
};

// Add variant
export const useAddVariant = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ productId, formData }: { productId: string; formData: FormData }) => {
      const { data } = await api.post(`/variants/${productId}`, formData);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: variantKeys.list(variables.productId) });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.productId) });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
};

// Update variant
export const useUpdateVariant = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      productId, 
      variantId, 
      formData 
    }: { 
      productId: string; 
      variantId: string; 
      formData: FormData 
    }) => {
      const { data } = await api.put(`/variants/${productId}/${variantId}`, formData);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: variantKeys.list(variables.productId) });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.productId) });
    },
  });
};

// Delete variant
export const useDeleteVariant = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ productId, variantId }: { productId: string; variantId: string }) => {
      await api.delete(`/variants/${productId}/${variantId}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: variantKeys.list(variables.productId) });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.productId) });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
};
