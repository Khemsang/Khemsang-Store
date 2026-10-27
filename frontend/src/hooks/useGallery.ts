import { useMemo } from "react";
import { useProducts } from "./useProducts";

export interface GalleryItem {
  _id: string;
  imageUrl: string;
  title: string;
  description?: string;
  category?: string;
}

/**
 * Derives gallery items from the already-cached products query.
 * No extra network request — React Query serves from cache.
 */
export const useGallery = () => {
  const { data: products = [], isLoading, isError } = useProducts(false);

  const items = useMemo<GalleryItem[]>(
    () =>
      products.flatMap((product) =>
        (product.images ?? []).map((imageUrl, index) => ({
          _id: `${product._id}-${index}`,
          imageUrl,
          title: product.title,
          description: product.description,
          category: product.category,
        }))
      ),
    [products]
  );

  return { items, isLoading, isError };
};
