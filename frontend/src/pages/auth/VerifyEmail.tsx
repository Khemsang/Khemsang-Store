import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { api } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { updateUser } = useAuth();
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying"
  );
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(5);
  const verifiedRef = useRef(false);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link");
      toast.error("Invalid verification link");
      return;
    }
    if (verifiedRef.current) return;
    verifiedRef.current = true;
    verifyEmail(token);
  }, [searchParams]);

  useEffect(() => {
    if (status === "success" && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (status === "success" && countdown === 0) {
      navigate("/", { replace: true });
    }
  }, [status, countdown, navigate]);

  const verifyEmail = async (token: string) => {
    try {
      const { data } = await api.get(`/auth/verify-email/${token}`);
      if (data.user) {
        // Set full user object for proper login state
        updateUser(data.user);
      }
      setStatus("success");
      setMessage("Your email has been verified successfully!");
      toast.success("Email verified! Welcome!");
    } catch (error: any) {
      setStatus("error");
      const errorMsg = error.response?.data?.message || "Verification failed";
      setMessage(errorMsg);
      toast.error(errorMsg);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div
        className={`absolute inset-0 transition-all duration-1000 ${
          status === "success"
            ? "bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600"
            : status === "error"
            ? "bg-gradient-to-br from-red-400 via-rose-500 to-pink-600"
            : "bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500"
        }`}
      >
        {/* Floating Circles */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          {/* Main Card */}
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-[2rem] shadow-2xl overflow-hidden">
            {/* ============ VERIFYING STATE ============ */}
            {status === "verifying" && (
              <>
                {/* Top Decoration */}
                <div className="h-2 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500"></div>

                <div className="p-10 text-center">
                  {/* Animated Icon */}
                  <div className="relative mx-auto w-32 h-32 mb-8">
                    {/* Outer Ring */}
                    <div className="absolute inset-0 rounded-full border-4 border-purple-200 dark:border-purple-900"></div>
                    {/* Spinning Ring */}
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin"></div>
                    {/* Inner Circle */}
                    <div className="absolute inset-4 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center shadow-lg">
                      <svg
                        className="w-12 h-12 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </div>

                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                    Verifying Your Email
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400 mb-8">
                    Please wait while we confirm your email address...
                  </p>

                  {/* Loading Dots */}
                  <div className="flex justify-center gap-2">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <span
                        key={i}
                        className="w-3 h-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 100}ms` }}
                      ></span>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ============ SUCCESS STATE ============ */}
            {status === "success" && (
              <>
                {/* Confetti-like top */}
                <div className="h-2 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500"></div>

                <div className="p-10 text-center">
                  {/* Success Icon with Animation */}
                  <div className="relative mx-auto w-32 h-32 mb-8">
                    <div className="absolute inset-0 bg-green-100 dark:bg-green-900/30 rounded-full animate-ping opacity-20"></div>
                    <div className="relative w-full h-full bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/30">
                      <svg
                        className="w-16 h-16 text-white animate-[bounce_1s_ease-in-out]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Celebration Emoji */}
                  <div className="text-5xl mb-4 animate-bounce">🎉</div>

                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                    Email Verified!
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400 mb-2">
                    {message}
                  </p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mb-6">
                    Redirecting in {countdown} seconds...
                  </p>

                  {/* Progress Bar */}
                  <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-8">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500 rounded-full transition-all duration-1000 ease-linear"
                      style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                    ></div>
                  </div>

                  {/* Features Unlocked */}
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-2xl p-6 mb-8 text-left">
                    <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300 mb-4 flex items-center gap-2">
                      <span className="text-lg">✨</span> Features Unlocked
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        "Shop Products",
                        "Track Orders",
                        "Save Wishlist",
                        "Get Deals",
                      ].map((feature, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => navigate("/")}
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl font-bold text-lg hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transform hover:scale-[1.02] flex items-center justify-center gap-3"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                    Start Shopping Now
                  </button>
                </div>
              </>
            )}

            {/* ============ ERROR STATE ============ */}
            {status === "error" && (
              <>
                <div className="h-2 bg-gradient-to-r from-red-400 via-rose-500 to-pink-500"></div>

                <div className="p-10 text-center">
                  {/* Error Icon */}
                  <div className="relative mx-auto w-32 h-32 mb-8">
                    <div className="absolute inset-0 bg-red-100 dark:bg-red-900/30 rounded-full animate-pulse"></div>
                    <div className="relative w-full h-full bg-gradient-to-br from-red-400 to-rose-500 rounded-full flex items-center justify-center shadow-2xl shadow-red-500/30">
                      <svg
                        className="w-16 h-16 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </div>
                  </div>

                  <div className="text-5xl mb-4">😔</div>

                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                    Verification Failed
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400 mb-8">
                    {message}
                  </p>

                  {/* Reasons Box */}
                  <div className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-2xl p-6 mb-8 text-left">
                    <p className="text-sm font-bold text-red-700 dark:text-red-300 mb-4 flex items-center gap-2">
                      <span className="text-lg">⚠️</span> Possible Reasons
                    </p>
                    <ul className="space-y-3">
                      {[
                        {
                          icon: "⏰",
                          text: "Link expired (valid for 15 minutes)",
                        },
                        { icon: "✅", text: "Link was already used" },
                        { icon: "🔗", text: "Link is invalid or corrupted" },
                      ].map((item, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-3 text-sm text-red-600 dark:text-red-400"
                        >
                          <span className="text-base">{item.icon}</span>
                          {item.text}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                      to="/login"
                      className="flex-1 py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-2xl font-bold hover:from-violet-600 hover:to-purple-700 transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                        />
                      </svg>
                      Go to Login
                    </Link>
                    <button
                      onClick={() => navigate("/signup")}
                      className="flex-1 py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700 rounded-2xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Try Again
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-white/80 mt-8">
            Need help?{" "}
            <Link
              to="/contact"
              className="text-white font-semibold hover:underline"
            >
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
