import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const PageLoader = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const location = useLocation();

  useEffect(() => {
    setLoading(true);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 100);

    const timer = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setLoading(false);
      }, 200);
    }, 1200);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-white via-purple-50/50 to-pink-50/50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[var(--root-color)]/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "0.5s" }}
          ></div>
        </div>

        <div className="relative text-center px-4">
          {/* Logo/Brand Animation */}
          <div className="relative w-32 h-32 mx-auto mb-8">
            {/* Outer Ring */}
            <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>

            {/* Animated Gradient Ring */}
            <svg
              className="absolute inset-0 w-full h-full -rotate-90"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${progress * 2.89}, 289`}
                className="transition-all duration-300 ease-out"
              />
              <defs>
                <linearGradient
                  id="gradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="var(--root-color)" />
                  <stop offset="50%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--root-color)] to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-12 animate-pulse">
                <svg
                  className="w-8 h-8 text-white -rotate-12"
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
            </div>

            {/* Floating Particles */}
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-[var(--root-color)] rounded-full animate-float opacity-60"></div>
            <div
              className="absolute -bottom-1 -left-1 w-3 h-3 bg-purple-500 rounded-full animate-float opacity-60"
              style={{ animationDelay: "0.3s" }}
            ></div>
            <div
              className="absolute top-1/2 -right-4 w-2 h-2 bg-pink-500 rounded-full animate-float opacity-60"
              style={{ animationDelay: "0.6s" }}
            ></div>
          </div>

          {/* Progress Percentage */}
          <div className="mb-4">
            <span className="text-4xl font-bold bg-gradient-to-r from-[var(--root-color)] via-purple-500 to-pink-500 bg-clip-text text-transparent">
              {Math.round(progress)}%
            </span>
          </div>

          {/* Loading Text */}
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            Loading
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            Preparing your experience...
          </p>

          {/* Progress Bar */}
          <div className="w-64 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mx-auto">
            <div
              className="h-full bg-gradient-to-r from-[var(--root-color)] via-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Animated Dots */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <span
              className="w-2 h-2 rounded-full bg-[var(--root-color)] animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></span>
            <span
              className="w-2 h-2 rounded-full bg-purple-500 animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></span>
            <span
              className="w-2 h-2 rounded-full bg-pink-500 animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></span>
          </div>
        </div>

        {/* Custom Animations */}
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-10px) scale(1.1); }
          }
          .animate-float {
            animation: float 2s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  return <>{children}</>;
};

export default PageLoader;
