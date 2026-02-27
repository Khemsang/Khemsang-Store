import React from "react";

interface LoadingProps {
  fullScreen?: boolean;
  text?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "minimal" | "dots";
}

const Loading: React.FC<LoadingProps> = ({
  fullScreen = false,
  text = "Loading...",
  size = "md",
  variant = "default",
}) => {
  const containerClasses = fullScreen
    ? "fixed inset-0 flex items-center justify-center bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm z-50"
    : "flex items-center justify-center min-h-[200px]";

  const sizeClasses = {
    sm: { spinner: "w-12 h-12", inner: "w-8 h-8", dot: "w-4 h-4", text: "text-sm" },
    md: { spinner: "w-20 h-20", inner: "w-14 h-14", dot: "w-7 h-7", text: "text-base" },
    lg: { spinner: "w-28 h-28", inner: "w-20 h-20", dot: "w-10 h-10", text: "text-lg" },
  };

  const currentSize = sizeClasses[size];

  if (variant === "minimal") {
    return (
      <div className={containerClasses}>
        <div className="flex flex-col items-center gap-4">
          <div className={`${currentSize.spinner} border-4 border-gray-200 dark:border-gray-700 border-t-purple-600 rounded-full animate-spin`}></div>
          {text && (
            <p className={`text-gray-600 dark:text-gray-400 font-medium ${currentSize.text}`}>
              {text}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div className={containerClasses}>
        <div className="flex flex-col items-center gap-6">
          <div className="flex gap-3">
            <div className="w-4 h-4 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
            <div className="w-4 h-4 bg-pink-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
            <div className="w-4 h-4 bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
          </div>
          {text && (
            <p className={`text-gray-600 dark:text-gray-400 font-medium ${currentSize.text}`}>
              {text}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center gap-6">
        {/* Simple spinner */}
        <div className={`${currentSize.spinner} border-4 border-gray-200 dark:border-gray-700 border-t-purple-600 rounded-full animate-spin`}></div>
        
        {text && (
          <div className="text-center space-y-3">
            <p className={`text-gray-700 dark:text-gray-300 font-semibold ${currentSize.text}`}>
              {text}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Loading;
