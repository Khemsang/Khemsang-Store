import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const PageLoader = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          {/* Spinner */}
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-purple-200 dark:border-purple-900 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-purple-600 rounded-full animate-spin"></div>
          </div>

          {/* Loading Text */}
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Loading...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please wait a moment
          </p>

          {/* Progress Bar */}
          <div className="w-64 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-6 mx-auto">
            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 animate-progress"></div>
          </div>
        </div>

        <style>{`
          @keyframes progress {
            0% { width: 0%; }
            100% { width: 100%; }
          }
          .animate-progress {
            animation: progress 3s ease-in-out;
          }
        `}</style>
      </div>
    );
  }

  return <>{children}</>;
};

export default PageLoader;
