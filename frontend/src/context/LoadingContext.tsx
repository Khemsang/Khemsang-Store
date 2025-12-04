import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface LoadingContextType {
  isLoading: boolean;
  showLoading: () => void;
  hideLoading: () => void;
  setLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  const showLoading = () => {
    // Clear any existing timeout
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
    }
    setIsLoading(true);

    // Auto-hide after 2 seconds max
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    setLoadingTimeout(timeout);
  };

  const hideLoading = () => {
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
      setLoadingTimeout(null);
    }
    setIsLoading(false);
  };

  const setLoading = (loading: boolean) => {
    if (loading) {
      showLoading();
    } else {
      hideLoading();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
    };
  }, [loadingTimeout]);

  return (
    <LoadingContext.Provider
      value={{ isLoading, showLoading, hideLoading, setLoading }}
    >
      {children}

      {/* Global Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm transition-all duration-300">
          <div className="flex flex-col items-center gap-4">
            {/* Animated Loader */}
            <div className="relative">
              {/* Outer ring */}
              <div className="w-16 h-16 border-4 border-purple-200 dark:border-purple-900 rounded-full"></div>
              {/* Spinning ring */}
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-purple-600 dark:border-t-purple-400 rounded-full animate-spin"></div>
              {/* Inner pulse */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
            </div>

            {/* Loading text */}
            <div className="flex items-center gap-1">
              <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                Loading
              </span>
              <span className="flex gap-1">
                <span
                  className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></span>
                <span
                  className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></span>
                <span
                  className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></span>
              </span>
            </div>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within LoadingProvider");
  }
  return context;
};
