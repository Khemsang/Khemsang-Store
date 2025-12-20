import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBolt } from "react-icons/fa";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

interface Product {
  _id: string;
  title: string;
  price: number;
  images: string[];
  stock?: number;
}

interface BuyNowButtonProps {
  product: Product;
  quantity?: number;
  className?: string;
  disabled?: boolean;
}

const BuyNowButton = ({
  product,
  quantity = 1,
  className = "",
  disabled = false,
}: BuyNowButtonProps) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { addToCart, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();

  const handleBuyNow = async () => {
    if (!user) {
      showToast("Please login to continue", "warning");
      navigate("/login", { state: { from: `/products/${product._id}` } });
      return;
    }

    if (product.stock !== undefined && product.stock < quantity) {
      showToast("Not enough stock available", "error");
      return;
    }

    setLoading(true);
    try {
      // Clear cart and add only this product
      clearCart();
      addToCart(product, quantity);

      // Navigate to checkout
      navigate("/checkout");
    } catch (error) {
      showToast("Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleBuyNow}
      disabled={disabled || loading}
      className={`flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <>
          <FaBolt className="w-4 h-4" />
          Buy Now
        </>
      )}
    </button>
  );
};

export default BuyNowButton;
