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
    sm: "w-8 h-8 border-2",
    md: "w-12 h-12 border-3",
    lg: "w-16 h-16 border-4",
    xl: "w-24 h-24 border-4",
  };

  const containerClasses = fullScreen
    ? "fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-50"
    : "flex items-center justify-center py-12";

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center gap-4">
        <div
          className={`${sizeClasses[size]} border-gray-200 dark:border-gray-700 border-t-green-600 dark:border-t-green-500 rounded-full animate-spin`}
        />
        {text && (
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium animate-pulse">
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

export default Loading;
