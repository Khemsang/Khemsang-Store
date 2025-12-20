import React from "react";

interface LoadingProps {
  size?: "sm" | "md" | "lg" | "xl";
  fullScreen?: boolean;
  text?: string;
}

const Loading: React.FC<LoadingProps> = ({
  size = "md",
  fullScreen = false,
  text = "Loading...",
}) => {
  const sizeClasses = {
    sm: { container: "w-12 h-12", inner: "w-6 h-6", border: "border-2" },
    md: { container: "w-16 h-16", inner: "w-8 h-8", border: "border-3" },
    lg: { container: "w-20 h-20", inner: "w-10 h-10", border: "border-4" },
    xl: { container: "w-28 h-28", inner: "w-14 h-14", border: "border-4" },
  };

  const containerClasses = fullScreen
    ? "fixed inset-0 flex items-center justify-center bg-gradient-to-br from-white via-purple-50/50 to-pink-50/50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 z-50"
    : "flex items-center justify-center py-12";

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center gap-4">
        <div className={`relative ${sizeClasses[size].container}`}>
          {/* Outer Ring */}
          <div
            className={`absolute inset-0 rounded-full ${sizeClasses[size].border} border-gray-200 dark:border-gray-700`}
          ></div>

          {/* Animated Ring */}
          <div
            className={`absolute inset-0 rounded-full ${sizeClasses[size].border} border-transparent border-t-[var(--root-color)] border-r-purple-500 animate-spin`}
          ></div>

          {/* Center Dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={`${sizeClasses[size].inner} bg-gradient-to-br from-[var(--root-color)] to-purple-600 rounded-xl animate-pulse`}
            ></div>
          </div>
        </div>

        {text && (
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

export default Loading;
