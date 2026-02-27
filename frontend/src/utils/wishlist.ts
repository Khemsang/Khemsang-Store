import { api } from "../services/api";

export const addToWishlist = async (productId: string, isLoggedIn: boolean) => {
  if (isLoggedIn) {
    await api.post("/auth/wishlist", { productId });
  } else {
    const saved = localStorage.getItem("wishlist");
    const ids: string[] = saved ? JSON.parse(saved) : [];
    if (!ids.includes(productId)) {
      ids.push(productId);
      localStorage.setItem("wishlist", JSON.stringify(ids));
    }
  }
};

export const removeFromWishlist = async (
  productId: string,
  isLoggedIn: boolean
) => {
  if (isLoggedIn) {
    await api.delete(`/auth/wishlist/${productId}`);
  } else {
    const saved = localStorage.getItem("wishlist");
    const ids: string[] = saved ? JSON.parse(saved) : [];
    const newIds = ids.filter((id) => id !== productId);
    localStorage.setItem("wishlist", JSON.stringify(newIds));
  }
};

export const isInWishlist = (productId: string, wishlistIds: string[]) => {
  return wishlistIds.includes(productId);
};

export const getLocalWishlist = (): string[] => {
  const saved = localStorage.getItem("wishlist");
  return saved ? JSON.parse(saved) : [];
};

export const toggleWishlist = async (
  productId: string,
  isLoggedIn: boolean,
  currentWishlist: string[]
) => {
  const isInList = currentWishlist.includes(productId);

  if (isInList) {
    await removeFromWishlist(productId, isLoggedIn);
    return currentWishlist.filter((id) => id !== productId);
  } else {
    await addToWishlist(productId, isLoggedIn);
    return [...currentWishlist, productId];
  }
};
