import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useToast } from "../context/ToastContext";

export const useProducts = (selectedCategory: string, searchTerm: string) => {
  const [products, setProducts] = useState<any[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { error } = useToast();

  // Fetch all categories once on mount
  useEffect(() => {
    fetchAllCategories();
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchTerm]);

  const fetchAllCategories = async () => {
    try {
      const { data } = await api.get("/products");
      const categories = [...new Set(data.map((p: any) => p.category))].filter(
        Boolean
      ) as string[];
      setAllCategories(categories);
    } catch (err) {
      console.error("Failed to fetch categories");
    }
  };

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

  return { products, allCategories, loading, refetch: fetchProducts };
};
