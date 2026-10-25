import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OrderItem {
  product: {
    _id: string;
    title: string;
    images: string[];
  } | null;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
  };
  createdAt: string;
}

export interface WishlistProduct {
  _id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  discount: number;
  stock: number;
  rating: number;
}

// ─── Query keys ───────────────────────────────────────────────────────────────

export const orderKeys = {
  all: ["orders"] as const,
  mine: () => [...orderKeys.all, "my-orders"] as const,
};

export const wishlistKeys = {
  all: ["wishlist"] as const,
  mine: () => [...wishlistKeys.all, "my-wishlist"] as const,
};

// ─── Orders ───────────────────────────────────────────────────────────────────

const fetchMyOrders = async (): Promise<Order[]> => {
  const { data } = await api.get("/orders/my-orders");
  // Backend now returns { orders, pagination } — handle both shapes
  return Array.isArray(data) ? data : (data.orders ?? []);
};

export const useOrdersQuery = (enabled = true) =>
  useQuery({
    queryKey: orderKeys.mine(),
    queryFn: fetchMyOrders,
    enabled,
    staleTime: 1000 * 60 * 2, // orders change frequently — 2 min
  });

// ─── Wishlist ─────────────────────────────────────────────────────────────────

const normaliseProduct = (p: any): WishlistProduct => ({
  _id: p._id,
  name: p.title ?? p.name,
  price: p.price,
  images: p.images ?? [],
  category: p.category?.name ?? p.category ?? "Uncategorized",
  discount: p.discount ?? 0,
  stock: p.stock ?? 0,
  rating: p.rating ?? 0,
});

const fetchWishlist = async (userId: string | undefined): Promise<WishlistProduct[]> => {
  if (userId) {
    const { data } = await api.get("/auth/wishlist");
    return (data as any[]).filter(Boolean).map(normaliseProduct);
  }

  // Guest: ids stored in localStorage, products fetched from catalogue
  const saved = localStorage.getItem("wishlist");
  const ids: string[] = saved ? JSON.parse(saved) : [];
  if (ids.length === 0) return [];

  const { data } = await api.get("/products");
  const catalogue: any[] = Array.isArray(data) ? data : (data.products ?? []);
  return catalogue.filter((p: any) => ids.includes(p._id)).map(normaliseProduct);
};

export const useWishlistQuery = (userId: string | undefined) =>
  useQuery({
    queryKey: [...wishlistKeys.mine(), userId ?? "guest"],
    queryFn: () => fetchWishlist(userId),
    staleTime: 1000 * 60 * 5,
  });

// ─── Wishlist mutations ───────────────────────────────────────────────────────

export const useRemoveFromWishlist = (userId: string | undefined) => {
  const qc = useQueryClient();
  const key = [...wishlistKeys.mine(), userId ?? "guest"];

  return useMutation({
    mutationFn: async (productId: string) => {
      if (userId) {
        await api.delete(`/auth/wishlist/${productId}`);
      } else {
        const saved = localStorage.getItem("wishlist");
        const ids: string[] = saved ? JSON.parse(saved) : [];
        localStorage.setItem("wishlist", JSON.stringify(ids.filter((id) => id !== productId)));
      }
    },
    onMutate: async (productId) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<WishlistProduct[]>(key);
      qc.setQueryData<WishlistProduct[]>(key, (old) =>
        old?.filter((p) => p._id !== productId) ?? []
      );
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(key, ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });
};

export const useClearWishlist = (userId: string | undefined) => {
  const qc = useQueryClient();
  const key = [...wishlistKeys.mine(), userId ?? "guest"];

  return useMutation({
    mutationFn: async (ids: string[]) => {
      if (userId) {
        // Single bulk call instead of sequential DELETEs
        await api.delete("/auth/wishlist", { data: { productIds: ids } });
      } else {
        localStorage.removeItem("wishlist");
      }
    },
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<WishlistProduct[]>(key);
      qc.setQueryData<WishlistProduct[]>(key, []);
      return { previous };
    },
    onError: (_err, _ids, ctx) => {
      if (ctx?.previous) qc.setQueryData(key, ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });
};
