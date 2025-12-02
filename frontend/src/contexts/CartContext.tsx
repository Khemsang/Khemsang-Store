import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { api } from "../services/api";
import { useAuth } from "./AuthContext";

interface CartItem {
  product: any;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  syncCart: () => Promise<void>;
  getCartTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCart();
      syncCart();
    } else {
      loadLocalCart();
    }
  }, [user]);

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

  const addToCart = async (productId: string, quantity = 1) => {
    if (user) {
      try {
        const { data } = await api.post("/cart", { productId, quantity });
        setCart(data);
      } catch (error) {
        console.error("Error adding to cart:", error);
      }
    } else {
      const existingItem = cart.find((item) => item.product._id === productId);
      let newCart;
      if (existingItem) {
        newCart = cart.map((item) =>
          item.product._id === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newCart = [...cart, { product: { _id: productId }, quantity }];
      }
      setCart(newCart);
      saveLocalCart(newCart);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (user) {
      try {
        const { data } = await api.put(`/cart/${productId}`, { quantity });
        setCart(data);
      } catch (error) {
        console.error("Error updating cart:", error);
      }
    } else {
      const newCart = cart.map((item) =>
        item.product._id === productId ? { ...item, quantity } : item
      );
      setCart(newCart);
      saveLocalCart(newCart);
    }
  };

  const removeFromCart = async (productId: string) => {
    if (user) {
      try {
        const { data } = await api.delete(`/cart/${productId}`);
        setCart(data);
      } catch (error) {
        console.error("Error removing from cart:", error);
      }
    } else {
      const newCart = cart.filter((item) => item.product._id !== productId);
      setCart(newCart);
      saveLocalCart(newCart);
    }
  };

  const clearCart = async () => {
    if (user) {
      try {
        await api.delete("/cart");
        setCart([]);
      } catch (error) {
        console.error("Error clearing cart:", error);
      }
    } else {
      setCart([]);
      localStorage.removeItem("cart");
    }
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
