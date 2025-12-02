import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { api } from "../../services/api";

const Checkout = () => {
  const { cart, getCartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { error, warning } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"esewa" | "cod">("esewa");

  // Check if user is logged in
  useEffect(() => {
    if (!user) {
      warning("Please login to continue with checkout");
      navigate("/login", { state: { from: "/checkout" } });
    }
    if (cart.length === 0) {
      warning("Your cart is empty");
      navigate("/products");
    }
  }, [user, cart, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Filter out items with incomplete product data
      const validItems = cart.filter(
        (item) => item.product && item.product._id && item.product.price
      );

      if (validItems.length === 0) {
        error("Your cart is empty or contains invalid items");
        setLoading(false);
        return;
      }

      const items = validItems.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
      }));

      console.log("Creating order with items:", items);
      console.log("Shipping address:", formData);
      console.log("Payment method:", paymentMethod);

      const { data } = await api.post("/orders", {
        items,
        totalAmount: getCartTotal() + 100,
        shippingAddress: formData,
        paymentMethod: paymentMethod,
      });

      console.log("Order created:", data);
      console.log("Payment Status:", data.paymentStatus);
      console.log("Payment Method:", data.paymentMethod);

      // If Cash on Delivery, redirect to success page
      if (paymentMethod === "cod") {
        console.log("💵 Cash on Delivery selected");
        navigate(`/payment/success?orderId=${data._id}`);
        return;
      }

      // eSewa Payment Integration - Using Form Submit
      const esewaUrl =
        import.meta.env.VITE_ESEWA_URL || "https://uat.esewa.com.np/epay/main";
      const apiUrl =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const merchantId = import.meta.env.VITE_ESEWA_MERCHANT_ID || "EPAYTEST";

      console.log("✅ Order created successfully:", data._id);
      console.log("💳 eSewa Payment Details:");
      console.log("  - Order ID:", data._id);
      console.log("  - Amount:", getCartTotal());
      console.log("  - Total:", getCartTotal() + 100);
      console.log("  - Merchant:", merchantId);
      console.log("🔄 Redirecting to eSewa...");

      // Create form for eSewa payment
      const form = document.createElement("form");
      form.method = "POST";
      form.action = esewaUrl;

      const params = {
        amt: getCartTotal().toString(),
        psc: "0",
        pdc: "0",
        txAmt: "0",
        tAmt: (getCartTotal() + 100).toString(),
        pid: data._id,
        scd: merchantId,
        su: `${apiUrl}/orders/esewa/verify`,
        fu: `${apiUrl}/orders/esewa/failure`,
      };

      Object.entries(params).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      console.log("📝 Form parameters:", params);
      console.log("🚀 Submitting to eSewa...");
      form.submit();
    } catch (err: any) {
      console.error("Order creation error:", err);
      console.error("Error response:", err.response);

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to create order. Please try again.";

      error(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-12 md:py-16 lg:py-20">
      <div className="container px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full mb-4 shadow-lg">
            <svg
              className="w-5 h-5 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
              <path
                fillRule="evenodd"
                d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Secure Checkout
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3">
            <span className="bg-gradient-to-r from-blue-600 via-green-600 to-emerald-600 bg-clip-text text-transparent">
              Complete Your Order
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg">
            Fast & secure payment with eSewa
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
          {/* Shipping Form - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-6 md:p-8 lg:p-10 shadow-2xl border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                    Shipping Information
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Enter your delivery details
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                    <span className="text-lg">👤</span>
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full px-5 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-green-300 dark:focus:ring-green-700 focus:border-green-500 transition-all duration-300 text-base font-medium"
                  />
                </div>

                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                    <span className="text-lg">📱</span>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="98XXXXXXXX"
                    className="w-full px-5 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-green-300 dark:focus:ring-green-700 focus:border-green-500 transition-all duration-300 text-base font-medium"
                  />
                </div>

                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                    <span className="text-lg">📍</span>
                    Delivery Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Street address, apartment, etc."
                    className="w-full px-5 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-green-300 dark:focus:ring-green-700 focus:border-green-500 transition-all duration-300 text-base font-medium"
                  />
                </div>

                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                    <span className="text-lg">🏙️</span>
                    City
                  </label>
                  <select
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-5 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-green-300 dark:focus:ring-green-700 focus:border-green-500 transition-all duration-300 text-base font-medium"
                  >
                    <option value="">Select City</option>
                    <option value="Kathmandu">Kathmandu</option>
                    <option value="Pokhara">Pokhara</option>
                    <option value="Lalitpur">Lalitpur</option>
                    <option value="Bhaktapur">Bhaktapur</option>
                    <option value="Biratnagar">Biratnagar</option>
                    <option value="Birgunj">Birgunj</option>
                    <option value="Dharan">Dharan</option>
                    <option value="Bharatpur">Bharatpur</option>
                    <option value="Hetauda">Hetauda</option>
                    <option value="Butwal">Butwal</option>
                    <option value="Janakpur">Janakpur</option>
                    <option value="Nepalgunj">Nepalgunj</option>
                    <option value="Dhangadhi">Dhangadhi</option>
                    <option value="Itahari">Itahari</option>
                    <option value="Tulsipur">Tulsipur</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Payment Method Selection */}
                <div className="pt-4 mb-6">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                    <span className="text-lg">💳</span>
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("esewa")}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        paymentMethod === "esewa"
                          ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-green-300"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <svg
                          className="w-8 h-8 text-green-600"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                        </svg>
                        <span className="font-semibold text-sm">eSewa</span>
                        {paymentMethod === "esewa" && (
                          <span className="text-xs text-green-600">
                            ✓ Selected
                          </span>
                        )}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cod")}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        paymentMethod === "cod"
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <svg
                          className="w-8 h-8 text-blue-600"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" />
                        </svg>
                        <span className="font-semibold text-sm">
                          Cash on Delivery
                        </span>
                        {paymentMethod === "cod" && (
                          <span className="text-xs text-blue-600">
                            ✓ Selected
                          </span>
                        )}
                      </div>
                    </button>
                  </div>
                </div>

                {/* Payment Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`group relative w-full py-5 md:py-6 ${
                      paymentMethod === "esewa"
                        ? "bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 hover:from-green-700 hover:to-emerald-700"
                        : "bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    } text-white rounded-2xl transition-all duration-300 shadow-2xl transform hover:scale-[1.02] font-bold text-lg md:text-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center overflow-hidden`}
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      {loading ? (
                        <>
                          <svg
                            className="animate-spin h-6 w-6 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          <span>Processing Payment...</span>
                        </>
                      ) : paymentMethod === "esewa" ? (
                        <>
                          <svg
                            className="w-7 h-7"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                          </svg>
                          <span>Pay with eSewa</span>
                          <svg
                            className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                          </svg>
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-7 h-7"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" />
                          </svg>
                          <span>Place Order (Cash on Delivery)</span>
                          <svg
                            className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                          </svg>
                        </>
                      )}
                    </span>
                  </button>

                  {/* Payment Info */}
                  <div
                    className={`mt-4 p-4 rounded-2xl border-2 ${
                      paymentMethod === "esewa"
                        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                        : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                          paymentMethod === "esewa"
                            ? "bg-green-500"
                            : "bg-blue-500"
                        }`}
                      >
                        <svg
                          className="w-5 h-5 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        {paymentMethod === "esewa" ? (
                          <>
                            <h4 className="font-bold text-green-800 dark:text-green-300 text-sm mb-1">
                              Secure Payment with eSewa
                            </h4>
                            <p className="text-xs text-green-700 dark:text-green-400">
                              You'll be redirected to eSewa to complete the
                              transaction securely.
                            </p>
                          </>
                        ) : (
                          <>
                            <h4 className="font-bold text-blue-800 dark:text-blue-300 text-sm mb-1">
                              Cash on Delivery
                            </h4>
                            <p className="text-xs text-blue-700 dark:text-blue-400">
                              Pay with cash when your order is delivered to your
                              doorstep.
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Order Summary - Takes 1 column on large screens */}
          <div className="lg:col-span-1">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl border border-gray-200 dark:border-gray-700 lg:sticky lg:top-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                    Order Summary
                  </h2>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {cart.length} {cart.length === 1 ? "item" : "items"}
                  </p>
                </div>
              </div>
              <div className="space-y-3 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {cart.map((item) => {
                  // Skip items with incomplete product data
                  if (!item.product || !item.product.title) {
                    return null;
                  }

                  return (
                    <div
                      key={item.product._id}
                      className="flex gap-3 md:gap-4 p-3 md:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={item.product.images?.[0] || "/placeholder.jpg"}
                          alt={item.product.title || "Product"}
                          className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-xl shadow-sm"
                        />
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm md:text-base mb-1 truncate">
                          {item.product.title}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          Qty: {item.quantity} × Rs.{" "}
                          {(item.product.price || 0).toLocaleString()}
                        </p>
                        <p className="text-sm md:text-base font-bold text-green-600 dark:text-green-400">
                          Rs.{" "}
                          {(
                            (item.product.price || 0) * item.quantity
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="space-y-4 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                  <span className="text-sm md:text-base">Subtotal</span>
                  <span className="font-bold text-base md:text-lg">
                    Rs. {getCartTotal().toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                  <span className="text-sm md:text-base flex items-center gap-2">
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
                        d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                      />
                    </svg>
                    Shipping
                  </span>
                  <span className="font-bold text-base md:text-lg">
                    Rs. 100
                  </span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t-2 border-gray-200 dark:border-gray-700">
                  <span className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                    Total Amount
                  </span>
                  <div className="text-right">
                    <span className="block text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      Rs. {(getCartTotal() + 100).toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Including all taxes
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #10b981;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #059669;
        }
      `}</style>
    </div>
  );
};

export default Checkout;
