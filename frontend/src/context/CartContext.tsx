import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from "react";
import { api } from "../services/api";
import { useAuth } from "./AuthContext";

interface CartItem {
  _id?: string;
  product: any;
  quantity: number;
  colorVariant?: { colorName: string; colorCode: string };
}

interface ColorVariant {
  colorName: string;
  colorCode: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (productId: string, quantity?: number, colorVariant?: ColorVariant) => Promise<{ isNew: boolean }>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  syncCart: () => Promise<void>;
  getCartTotal: () => number;
  cartTotal: number;
  resetToastTracking: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LS_KEY = "cart";
const loadLocal = (): CartItem[] => {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]");
  } catch {
    return [];
  }
};
const saveLocal = (items: CartItem[]) =>
  localStorage.setItem(LS_KEY, JSON.stringify(items));

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { user } = useAuth();
  const toastShownRef = useRef<Set<string>>(new Set());

  // ── Fetch / sync on user change ───────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      setCart(loadLocal());
      return;
    }

    const mergeAndFetch = async () => {
      try {
        const local = loadLocal();
        if (local.length > 0) {
          await api.post("/cart/merge", { items: local });
          localStorage.removeItem(LS_KEY);
        }
      } catch {
        // merge failure is non-fatal
      }
      try {
        const { data } = await api.get("/cart");
        setCart(data);
      } catch {
        // keep current cart on fetch failure
      }
    };
    mergeAndFetch();
  }, [user]);

  // ── Cart total (memoized so getCartTotal() is free) ────────────────────────
  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + (item.product?.price ?? 0) * item.quantity, 0),
    [cart]
  );

  // Stable function reference for callers that still call getCartTotal()
  const getCartTotal = useCallback(() => cartTotal, [cartTotal]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const toastKey = (productId: string, colorVariant?: ColorVariant) =>
    `${productId}-${colorVariant?.colorName ?? "default"}`;

  const shouldShowToast = (key: string): boolean => {
    if (toastShownRef.current.has(key)) return false;
    toastShownRef.current.add(key);
    return true;
  };

  // ── addToCart ─────────────────────────────────────────────────────────────
  const addToCart = useCallback(
    async (productId: string, quantity = 1, colorVariant?: ColorVariant) => {
      const key = toastKey(productId, colorVariant);

      if (user) {
        try {
          const { data } = await api.post("/cart", { productId, quantity, colorVariant });

          if (data.cart && data.isNewItem !== undefined) {
            setCart(data.cart);
            const isNew = data.isNewItem && shouldShowToast(key);
            return { isNew };
          }

          if (Array.isArray(data)) {
            setCart(data);
            return { isNew: shouldShowToast(key) };
          }

          setCart(data);
          return { isNew: false };
        } catch {
          return { isNew: false };
        }
      }

      // Guest cart
      const isSame = (item: CartItem) => {
        const sameProduct = item.product._id === productId;
        const sameVariant = colorVariant
          ? item.colorVariant?.colorName === colorVariant.colorName
          : !item.colorVariant;
        return sameProduct && sameVariant;
      };

      const existing = cart.find(isSame);
      const isNew = !existing && shouldShowToast(key);

      const newCart = existing
        ? cart.map((item) =>
            isSame(item) ? { ...item, quantity: item.quantity + quantity } : item
          )
        : [...cart, { product: { _id: productId }, quantity, colorVariant }];

      setCart(newCart);
      saveLocal(newCart);
      return { isNew };
    },
    [user, cart]
  );

  // ── updateQuantity ────────────────────────────────────────────────────────
  const updateQuantity = useCallback(
    async (cartItemId: string, quantity: number) => {
      if (user) {
        try {
          const { data } = await api.put(`/cart/item/${cartItemId}`, { quantity });
          setCart(data);
        } catch {
          // ignore — optimistic update not needed here
        }
        return;
      }
      const newCart = cart.map((item, i) =>
        i.toString() === cartItemId ? { ...item, quantity } : item
      );
      setCart(newCart);
      saveLocal(newCart);
    },
    [user, cart]
  );

  // ── removeFromCart ────────────────────────────────────────────────────────
  const removeFromCart = useCallback(
    async (cartItemId: string) => {
      if (user) {
        try {
          const { data } = await api.delete(`/cart/item/${cartItemId}`);
          setCart(data);
        } catch {
          // ignore
        }
        return;
      }
      const newCart = cart.filter((_, i) => i.toString() !== cartItemId);
      setCart(newCart);
      saveLocal(newCart);
    },
    [user, cart]
  );

  // ── clearCart ─────────────────────────────────────────────────────────────
  const clearCart = useCallback(async () => {
    toastShownRef.current.clear();
    if (user) {
      try {
        await api.delete("/cart");
      } catch {
        // ignore
      }
    } else {
      localStorage.removeItem(LS_KEY);
    }
    setCart([]);
  }, [user]);

  // ── syncCart ──────────────────────────────────────────────────────────────
  const syncCart = useCallback(async () => {
    const local = loadLocal();
    if (!user || local.length === 0) return;
    try {
      await api.post("/cart/merge", { items: local });
      localStorage.removeItem(LS_KEY);
      const { data } = await api.get("/cart");
      setCart(data);
    } catch {
      // ignore
    }
  }, [user]);

  const resetToastTracking = useCallback(() => {
    toastShownRef.current.clear();
  }, []);

  // ── Stable context value ──────────────────────────────────────────────────
  const value = useMemo(
    () => ({
      cart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      syncCart,
      getCartTotal,
      cartTotal,
      resetToastTracking,
    }),
    [
      cart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      syncCart,
      getCartTotal,
      cartTotal,
      resetToastTracking,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
