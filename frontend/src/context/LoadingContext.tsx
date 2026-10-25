import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
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
  // useRef instead of useState — updating it never triggers a re-render
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideLoading = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsLoading(false);
  }, []);

  const showLoading = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsLoading(true);
    // Auto-hide after 2 s as a safety net
    timeoutRef.current = setTimeout(() => setIsLoading(false), 2000);
  }, []);

  const setLoading = useCallback(
    (loading: boolean) => (loading ? showLoading() : hideLoading()),
    [showLoading, hideLoading]
  );

  // Stable reference — only recreated when isLoading changes
  const value = useMemo(
    () => ({ isLoading, showLoading, hideLoading, setLoading }),
    [isLoading, showLoading, hideLoading, setLoading]
  );

  return (
    <LoadingContext.Provider value={value}>
      {children}

      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-200 dark:border-purple-900 rounded-full" />
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-600 dark:border-t-purple-400 rounded-full animate-spin" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full animate-pulse" />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                Loading
              </span>
              <span className="flex gap-1">
                {(["0ms", "150ms", "300ms"] as const).map((delay, i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce"
                    style={{ animationDelay: delay }}
                  />
                ))}
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
  if (!context) throw new Error("useLoading must be used within LoadingProvider");
  return context;
};
