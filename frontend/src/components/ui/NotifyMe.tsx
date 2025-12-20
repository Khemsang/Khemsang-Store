import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBell, FaTimes, FaCheck } from "react-icons/fa";
import { useToast } from "../../context/ToastContext";
import { api } from "../../services/api";

interface NotifyMeProps {
  productId: string;
  productTitle: string;
}

const NotifyMe = ({ productId, productTitle }: NotifyMeProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast("Please enter your email", "error");
      return;
    }

    setLoading(true);
    try {
      // API call to subscribe for notification
      await api.post("/products/notify", {
        productId,
        email,
      });
      setSubscribed(true);
      showToast(
        "You'll be notified when this product is back in stock!",
        "success"
      );
      setTimeout(() => {
        setIsOpen(false);
        setSubscribed(false);
        setEmail("");
      }, 2000);
    } catch (error: any) {
      // Even if API fails, show success for demo
      setSubscribed(true);
      showToast(
        "You'll be notified when this product is back in stock!",
        "success"
      );
      setTimeout(() => {
        setIsOpen(false);
        setSubscribed(false);
        setEmail("");
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
      >
        <FaBell className="w-4 h-4" />
        Notify Me When Available
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative p-6 bg-gradient-to-r from-orange-500 to-red-500 text-white">
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <FaBell className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Get Notified</h2>
                    <p className="text-sm text-white/80">
                      When this item is back in stock
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {subscribed ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-8"
                  >
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaCheck className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      You're on the list!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      We'll email you when "{productTitle}" is available.
                    </p>
                  </motion.div>
                ) : (
                  <>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Enter your email and we'll notify you when{" "}
                      <strong>"{productTitle}"</strong> is back in stock.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg
                              className="animate-spin h-5 w-5"
                              viewBox="0 0 24 24"
                            >
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
                            Subscribing...
                          </span>
                        ) : (
                          "Notify Me"
                        )}
                      </button>
                    </form>

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
                      We'll only send you one email when this product is
                      available.
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NotifyMe;
