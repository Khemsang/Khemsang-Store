interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
  variant?: "default" | "minimal" | "dots";
  size?: "sm" | "md" | "lg";
}

export const Loading = ({ 
  message = "Loading...", 
  fullScreen = false,
  variant = "default",
  size = "md"
}: LoadingProps) => {
  const containerClass = fullScreen 
    ? "fixed inset-0 flex flex-col items-center justify-center z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm" 
    : "flex flex-col items-center justify-center min-h-[200px]";

  const sizeClasses = {
    sm: { spinner: "w-12 h-12", inner: "w-8 h-8", dot: "w-4 h-4", text: "text-sm" },
    md: { spinner: "w-20 h-20", inner: "w-14 h-14", dot: "w-7 h-7", text: "text-base" },
    lg: { spinner: "w-28 h-28", inner: "w-20 h-20", dot: "w-10 h-10", text: "text-lg" },
  };

  const currentSize = sizeClasses[size];

  if (variant === "minimal") {
    return (
      <div className={containerClass}>
        <div className="flex flex-col items-center gap-4">
          <div className={`${currentSize.spinner} border-4 border-gray-200 dark:border-gray-700 border-t-purple-600 rounded-full animate-spin`}></div>
          {message && (
            <p className={`text-gray-600 dark:text-gray-400 font-medium ${currentSize.text}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div className={containerClass}>
        <div className="flex flex-col items-center gap-6">
          <div className="flex gap-3">
            <div className="w-4 h-4 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
            <div className="w-4 h-4 bg-pink-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
            <div className="w-4 h-4 bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
          </div>
          {message && (
            <p className={`text-gray-600 dark:text-gray-400 font-medium ${currentSize.text}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center gap-6">
        {/* Modern spinner with gradient */}
        <div className="relative">
          {/* Outer spinning ring */}
          <div className={`${currentSize.spinner} rounded-full border-4 border-gray-200 dark:border-gray-700`}></div>
          
          {/* Gradient spinning border */}
          <div 
            className={`absolute inset-0 ${currentSize.spinner} rounded-full border-4 border-transparent animate-spin`}
            style={{ 
              animationDuration: "1.2s",
              background: "linear-gradient(to right, rgb(147, 51, 234), rgb(219, 39, 119), rgb(249, 115, 22))",
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
              padding: "4px"
            }}
          ></div>
          
          {/* Inner pulsing circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`${currentSize.inner} rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 animate-pulse`}></div>
          </div>
          
          {/* Center white dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`${currentSize.dot} rounded-full bg-white dark:bg-gray-800 shadow-lg`}></div>
          </div>
        </div>
        
        {message && (
          <div className="text-center space-y-3">
            <p className={`text-gray-700 dark:text-gray-300 font-semibold ${currentSize.text}`}>
              {message}
            </p>
            <div className="flex gap-2 justify-center">
              <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
              <div className="w-2 h-2 bg-pink-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
              <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
