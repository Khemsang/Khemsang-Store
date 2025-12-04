import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      navigate("/login", { state: { from: "/checkout" } });
    } else {
      navigate("/checkout");
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="text-center py-16">
            <div className="mx-auto h-24 w-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
              <svg
                className="h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Add some products to get started!
            </p>
            <button
              onClick={() => navigate("/products")}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[var(--root-color)] to-purple-600 text-white rounded-xl hover:from-[var(--root-color)] hover:to-purple-700 transition-all duration-200 shadow-lg transform hover:scale-105"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 sm:py-12 md:py-16 lg:py-20">
      <div className="container px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Shopping Cart
          </h1>
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full">
            {cart.length} {cart.length === 1 ? "item" : "items"}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            {cart.map((item) => {
              // Skip items with incomplete product data
              if (!item.product || !item.product.title) {
                return null;
              }

              return (
                <div
                  key={item.product._id}
                  className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-200"
                >
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    <div className="flex-shrink-0 mx-auto sm:mx-0">
                      <img
                        src={item.product.images?.[0] || "/placeholder.jpg"}
                        alt={item.product.title || "Product"}
                        className="w-full sm:w-24 md:w-32 h-48 sm:h-24 md:h-32 object-cover rounded-xl"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {item.product.title}
                      </h3>
                      <p className="text-xl sm:text-2xl font-bold text-[var(--root-color)] mb-3 sm:mb-4">
                        Rs. {item.product.price?.toLocaleString() || 0}
                      </p>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                        <div className="flex items-center justify-center gap-2 sm:gap-3 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product._id,
                                Math.max(1, item.quantity - 1)
                              )
                            }
                            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20 12H4"
                              />
                            </svg>
                          </button>
                          <span className="w-10 sm:w-12 text-center font-semibold text-gray-900 dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product._id,
                                item.quantity + 1
                              )
                            }
                            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product._id)}
                          className="flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <svg
                            className="w-4 h-4 sm:w-5 sm:h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          <span className="text-sm font-medium">Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700 lg:sticky lg:top-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-5 sm:mb-6">
                Order Summary
              </h2>
              <div className="space-y-3 sm:space-y-4 mb-5 sm:mb-6">
                <div className="flex justify-between text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span className="font-semibold">
                    Rs. {getCartTotal().toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span className="font-semibold">Rs. 100</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 sm:pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                      Total
                    </span>
                    <span className="text-xl sm:text-2xl font-bold text-[var(--root-color)]">
                      Rs. {(getCartTotal() + 100).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full py-3 sm:py-4 bg-gradient-to-r from-[var(--root-color)] to-purple-600 text-white rounded-xl hover:from-[var(--root-color)] hover:to-purple-700 transition-all duration-200 shadow-lg transform hover:scale-[1.02] font-semibold text-base sm:text-lg"
              >
                Proceed to Checkout
              </button>
              <button
                onClick={() => navigate("/products")}
                className="w-full mt-3 py-2.5 sm:py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium text-sm sm:text-base"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
