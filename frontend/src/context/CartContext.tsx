import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { api } from "../services/api";
import { useAuth } from "./AuthContext";

interface CartItem {
  _id?: string;
  product: any;
  quantity: number;
  colorVariant?: {
    colorName: string;
    colorCode: string;
  };
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (productId: string, quantity?: number, colorVariant?: { colorName: string; colorCode: string }) => Promise<{ isNew: boolean }>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  syncCart: () => Promise<void>;
  getCartTotal: () => number;
  resetToastTracking: () => void; // New function to reset toast tracking
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { user } = useAuth();
  const toastShownRef = useRef<Set<string>>(new Set()); // Track products that already showed toast

  useEffect(() => {
    if (user) {
      // First sync local cart to backend, then fetch
      syncCartAndFetch();
    } else {
      loadLocalCart();
    }
  }, [user]);

  const syncCartAndFetch = async () => {
    try {
      const localCart = localStorage.getItem("cart");
      if (localCart) {
        const items = JSON.parse(localCart);
        if (items.length > 0) {
          await api.post("/cart/merge", { items });
          localStorage.removeItem("cart");
        }
      }
      // Always fetch cart after sync attempt
      await fetchCart();
    } catch (error) {
      // Still try to fetch cart even if sync fails
      await fetchCart();
    }
  };

  const loadLocalCart = () => {
    const localCart = localStorage.getItem("cart");
    if (localCart) {
      setCart(JSON.parse(localCart));
    }
  };

  const saveLocalCart = (cartData: CartItem[]) => {
    localStorage.setItem("cart", JSON.stringify(cartData));
  };

  const fetchCart = async () => {
    try {
      const { data } = await api.get("/cart");
      setCart(data);
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  const syncCart = async () => {
    try {
      const localCart = localStorage.getItem("cart");
      if (localCart) {
        const items = JSON.parse(localCart);
        if (items.length > 0) {
          await api.post("/cart/merge", { items });
          localStorage.removeItem("cart");
          fetchCart();
        }
      }
    } catch (error) {
      console.error("Error syncing cart:", error);
    }
  };

  const addToCart = async (productId: string, quantity = 1, colorVariant?: { colorName: string; colorCode: string }) => {
    if (user) {
      try {
        const { data } = await api.post("/cart", { productId, quantity, colorVariant });
        
        // Create unique key for product + variant combination
        const cartKey = `${productId}-${colorVariant?.colorName || 'default'}`;
        
        // Check if toast was already shown for this product in this session
        const toastAlreadyShown = toastShownRef.current.has(cartKey);
        
        // Handle response format
        if (data.cart && data.isNewItem !== undefined) {
          // New format: { cart: [...], isNewItem: boolean }
          setCart(data.cart);
          
          // Only return isNew=true if it's truly new AND toast hasn't been shown yet
          const shouldShowToast = data.isNewItem && !toastAlreadyShown;
          
          if (shouldShowToast) {
            toastShownRef.current.add(cartKey);
          } else if (data.isNewItem && toastAlreadyShown) {
          } else {
          }
          
          return { isNew: shouldShowToast };
        } else if (Array.isArray(data)) {
          // Old format: just array (assume new item for backward compatibility)
          setCart(data);
          
          const shouldShowToast = !toastAlreadyShown;
          if (shouldShowToast) {
            toastShownRef.current.add(cartKey);
          }
          
          return { isNew: shouldShowToast };
        } else {
          setCart(data);
          return { isNew: false };
        }
      } catch (error) {
        console.error("Error adding to cart:", error);
        return { isNew: false };
      }
    } else {
      // Find existing item with same product AND same color variant
      const existingItem = cart.find((item) => {
        const sameProduct = item.product._id === productId;
        const sameVariant = colorVariant 
          ? (item.colorVariant?.colorName === colorVariant.colorName)
          : !item.colorVariant;
        return sameProduct && sameVariant;
      });

      // Create unique key for product + variant combination
      const cartKey = `${productId}-${colorVariant?.colorName || 'default'}`;
      const toastAlreadyShown = toastShownRef.current.has(cartKey);
      
      const isNew = !existingItem && !toastAlreadyShown;
      
      if (!existingItem && !toastAlreadyShown) {
        toastShownRef.current.add(cartKey);
      }
      
      let newCart;
      
      if (existingItem) {
        // Update existing item quantity
        newCart = cart.map((item) => {
          const sameProduct = item.product._id === productId;
          const sameVariant = colorVariant 
            ? (item.colorVariant?.colorName === colorVariant.colorName)
            : !item.colorVariant;
          return sameProduct && sameVariant
            ? { ...item, quantity: item.quantity + quantity, colorVariant }
            : item;
        });
      } else {
        // Create new cart item for different variant
        newCart = [...cart, { product: { _id: productId }, quantity, colorVariant }];
      }
      setCart(newCart);
      saveLocalCart(newCart);
      return { isNew };
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (user) {
      try {
        const { data } = await api.put(`/cart/item/${cartItemId}`, { quantity });
        setCart(data);
      } catch (error) {
        console.error("Error updating cart:", error);
      }
    } else {
      const newCart = cart.map((item, index) =>
        index.toString() === cartItemId ? { ...item, quantity } : item
      );
      setCart(newCart);
      saveLocalCart(newCart);
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    if (user) {
      try {
        const { data } = await api.delete(`/cart/item/${cartItemId}`);
        setCart(data);
      } catch (error) {
        console.error("Error removing from cart:", error);
      }
    } else {
      const newCart = cart.filter((_, index) => index.toString() !== cartItemId);
      setCart(newCart);
      saveLocalCart(newCart);
    }
  };

  const clearCart = async () => {
    if (user) {
      try {
        await api.delete("/cart");
        setCart([]);
        toastShownRef.current.clear(); // Clear toast tracking when cart is cleared
      } catch (error) {
        console.error("Error clearing cart:", error);
      }
    } else {
      setCart([]);
      localStorage.removeItem("cart");
      toastShownRef.current.clear(); // Clear toast tracking when cart is cleared
    }
  };

  const resetToastTracking = () => {
    toastShownRef.current.clear();
  };

  const getCartTotal = () => {
    return cart.reduce(
      (total, item) => total + (item.product?.price || 0) * item.quantity,
      0
    );
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        syncCart,
        getCartTotal,
        resetToastTracking,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
