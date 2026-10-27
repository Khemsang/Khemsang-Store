import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { testimonialsApi } from "../../services/api";
import { FaStar } from "react-icons/fa";
import { useInvalidateTestimonials } from "../../hooks/useServerQueries";

const SubmitTestimonial: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    quote: "",
    rating: 5,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      error("Please login to submit a testimonial");
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const response = await testimonialsApi.create(formData);


      await dispatch(fetchTestimonials());

      success("Thank you! Your testimonial has been posted successfully!");
      navigate("/");
    } catch (err: any) {
      console.error("Error submitting testimonial:", err);
      console.error("Error response:", err.response);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to submit testimonial";
      error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setFormData({ ...formData, rating: star })}
            className="cursor-pointer hover:scale-110 transition-transform"
          >
            <FaStar
              className={`text-3xl ${
                star <= rating
                  ? "text-yellow-400"
                  : "text-gray-300 dark:text-gray-600"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 py-16 md:py-20 relative overflow-hidden">
      
      <div className="absolute top-20 left-10 w-40 h-40 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-gradient-to-br from-orange-400/20 to-yellow-400/20 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>

      <div className="container px-4 md:px-6 lg:px-8 max-w-3xl mx-auto relative z-10">
        
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full mb-6 shadow-lg">
            <span className="text-2xl">✨</span>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Share Your Story
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
              Share Your Experience
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            We'd love to hear about your experience with our products and
            services
          </p>
        </div>

        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-2xl border border-purple-100 dark:border-purple-900">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                <span className="text-xl">👤</span>
                Your Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-5 py-4 rounded-2xl border-2 border-purple-200 dark:border-purple-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-purple-300 dark:focus:ring-purple-700 focus:border-purple-500 transition-all duration-300 text-lg font-medium"
                placeholder="Enter your name"
              />
            </div>

            
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">
                <span className="text-xl">⭐</span>
                Your Rating
              </label>
              <div className="flex justify-center p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border-2 border-purple-200 dark:border-purple-800">
                {renderStars(formData.rating)}
              </div>
            </div>

            
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                <span className="text-xl">💬</span>
                Your Testimonial
              </label>
              <textarea
                required
                rows={6}
                value={formData.quote}
                onChange={(e) =>
                  setFormData({ ...formData, quote: e.target.value })
                }
                className="w-full px-5 py-4 rounded-2xl border-2 border-purple-200 dark:border-purple-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-purple-300 dark:focus:ring-purple-700 focus:border-purple-500 transition-all duration-300 text-lg resize-none"
                placeholder="Share your experience with our products and services..."
              />
              <div className="flex items-center justify-between mt-2 px-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Minimum 10 characters
                </p>
                <p
                  className={`text-sm font-semibold ${
                    formData.quote.length >= 10
                      ? "text-green-600 dark:text-green-400"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {formData.quote.length} / 10
                </p>
              </div>
            </div>

            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="submit"
                disabled={loading || formData.quote.length < 10}
                className="flex-1 group relative py-5 px-8 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <span className="text-xl">✨</span>
                      Submit Testimonial
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
              <button
                type="button"
                onClick={() => navigate("/")}
                className="px-8 py-5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl font-bold text-lg border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-300 shadow-lg"
              >
                Cancel
              </button>
            </div>
          </form>

          
          <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border-2 border-green-200 dark:border-green-800 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-2xl shadow-lg">
                ✓
              </div>
              <div>
                <h3 className="font-bold text-green-800 dark:text-green-300 text-lg mb-1">
                  Instant Publishing!
                </h3>
                <p className="text-sm text-green-700 dark:text-green-400">
                  Your testimonial will be published immediately on the website
                  for everyone to see. Thank you for sharing your experience!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default SubmitTestimonial;
