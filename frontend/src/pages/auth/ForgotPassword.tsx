import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaEnvelope,
  FaCheckCircle,
  FaTimesCircle,
  FaPaperPlane,
  FaArrowLeft,
} from "react-icons/fa";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setSent(true);
        setMessage(
          data.message || "A password reset link has been sent to your email."
        );
      } else {
        setError(data.message || "Something went wrong.");
      }
    } catch {
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900/20 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-3xl p-10 text-center border border-gray-100 dark:border-gray-700">
            <div className="mx-auto h-24 w-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-8 shadow-xl">
              <FaCheckCircle className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Check Your Email
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-2">{message}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-8">
              If you don't see the email, check your spam folder.
            </p>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-8">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Email sent to:{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {email}
                </span>
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setSent(false);
                  setEmail("");
                }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[var(--root-color)] to-purple-600 text-white rounded-xl font-semibold hover:from-[var(--root-color)] hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <FaPaperPlane className="w-4 h-4" />
                Send Again
              </button>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-600 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 transition-all"
              >
                <FaArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/20 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-[var(--root-color)] to-purple-600 rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-105 transition-transform duration-300 mb-6">
            <FaEnvelope className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Forgot Password?
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            No worries! Enter your email and we'll send you a reset link.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-3xl p-8 sm:p-10 border border-gray-100 dark:border-gray-700">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-lg mb-6 flex items-center gap-3">
              <FaTimesCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="block w-full pl-12 pr-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--root-color)] focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-[var(--root-color)] to-purple-600 hover:from-[var(--root-color)] hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--root-color)] disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                  Sending...
                </>
              ) : (
                <>
                  <FaPaperPlane className="mr-2 h-4 w-4" />
                  Send Reset Link
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-[var(--root-color)] transition-colors duration-200"
            >
              <FaArrowLeft className="w-3 h-3" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
