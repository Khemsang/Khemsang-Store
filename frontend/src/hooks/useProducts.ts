import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useToast } from "../contexts/ToastContext";

export const useProducts = (selectedCategory: string, searchTerm: string) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { error } = useToast();

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory) params.append("category", selectedCategory);
      if (searchTerm) params.append("search", searchTerm);

      const { data } = await api.get(`/products?${params.toString()}`);
      setProducts(data);
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  return { products, loading, refetch: fetchProducts };
};
