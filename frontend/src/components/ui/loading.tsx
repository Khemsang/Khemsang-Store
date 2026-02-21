import { ShoppingCart, Package, Truck, Loader2 } from "lucide-react";

interface LoadingProps {
  message?: string;
  variant?: "default" | "cart" | "product" | "delivery";
}

export const Loading = ({ message = "Loading...", variant = "default" }: LoadingProps) => {
  if (variant === "cart") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative">
          {/* Outer rotating ring */}
          <div className="w-24 h-24 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 border-r-blue-400 rounded-full animate-spin"></div>
          
          {/* Inner pulsing ring */}
          <div className="absolute inset-2 border-4 border-transparent border-b-orange-500 border-l-orange-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-gradient-to-br from-blue-500 to-orange-500 p-3 rounded-xl shadow-lg">
              <ShoppingCart className="w-6 h-6 text-white animate-pulse" />
            </div>
          </div>
        </div>
        <p className="mt-6 text-gray-700 dark:text-gray-300 font-semibold text-lg">{message}</p>
        <div className="flex gap-1 mt-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
        </div>
      </div>
    );
  }

  if (variant === "product") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative">
          {/* Rotating gradient ring */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 p-1 animate-spin">
            <div className="w-full h-full bg-white dark:bg-gray-900 rounded-full"></div>
          </div>
          
          {/* Center icon with scale animation */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-gradient-to-br from-green-500 to-blue-600 p-3 rounded-xl shadow-lg animate-pulse">
              <Package className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <p className="mt-6 text-gray-700 dark:text-gray-300 font-semibold text-lg">{message}</p>
        <div className="flex gap-1 mt-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
        </div>
      </div>
    );
  }

  if (variant === "delivery") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative">
          {/* Double ring animation */}
          <div className="w-24 h-24 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-orange-500 rounded-full animate-spin"></div>
          <div className="absolute inset-3 border-4 border-transparent border-b-green-500 rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
          
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-gradient-to-br from-orange-500 to-green-500 p-3 rounded-xl shadow-lg">
              <Truck className="w-6 h-6 text-white animate-pulse" />
            </div>
          </div>
        </div>
        <p className="mt-6 text-gray-700 dark:text-gray-300 font-semibold text-lg">{message}</p>
        <div className="flex gap-1 mt-3">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
        </div>
      </div>
    );
  }

  // Default loading - Modern gradient spinner
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="relative w-24 h-24">
        {/* Outer gradient ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 opacity-20"></div>
        
        {/* Spinning gradient border */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 animate-spin" style={{ 
          maskImage: 'linear-gradient(transparent 50%, black 50%)',
          WebkitMaskImage: 'linear-gradient(transparent 50%, black 50%)'
        }}></div>
        
        {/* Inner circle */}
        <div className="absolute inset-1 rounded-full bg-white dark:bg-gray-900"></div>
        
        {/* Center animated icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-orange-500 rounded-xl animate-pulse shadow-lg"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          </div>
        </div>
      </div>
      
      <p className="mt-6 text-gray-700 dark:text-gray-300 font-semibold text-lg">{message}</p>
      
      {/* Animated dots */}
      <div className="flex gap-1.5 mt-4">
        <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
        <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
        <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
      </div>
    </div>
  );
};

// Full page loading overlay
export const LoadingOverlay = ({ message = "Loading..." }: { message?: string }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 dark:bg-gray-900/90 backdrop-blur-md">
      <div className="text-center">
        <div className="relative w-28 h-28 mx-auto mb-8">
          {/* Outer rotating gradient ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 animate-spin" style={{ animationDuration: '2s' }}></div>
          <div className="absolute inset-1 rounded-full bg-white dark:bg-gray-900"></div>
          
          {/* Inner counter-rotating ring */}
          <div className="absolute inset-3 rounded-full border-4 border-transparent border-t-blue-500 border-r-purple-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-orange-500 p-4 rounded-2xl shadow-2xl">
              <ShoppingCart className="w-8 h-8 text-white animate-pulse" />
            </div>
          </div>
        </div>
        
        <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">{message}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">Please wait a moment...</p>
        
        {/* Animated progress dots */}
        <div className="flex justify-center gap-2 mt-6">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
        </div>
      </div>
    </div>
  );
};

// Skeleton loader for cards
export const SkeletonCard = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
      </div>
    </div>
  );
};

// Skeleton loader for product grid
export const SkeletonProduct = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 animate-pulse">
      <div className="w-full h-48 bg-gray-200 dark:bg-gray-700"></div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
      </div>
    </div>
  );
};

// Inline spinner
export const Spinner = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const sizes = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-3",
    lg: "w-8 h-8 border-4",
  };

  return (
    <div className="relative inline-block">
      <div className={`${sizes[size]} border-gray-200 dark:border-gray-700 rounded-full`}></div>
      <div className={`absolute inset-0 ${sizes[size]} border-transparent border-t-blue-600 border-r-purple-600 rounded-full animate-spin`}></div>
    </div>
  );
};

// Dots loading
export const DotsLoading = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce shadow-lg" style={{ animationDelay: "0ms" }}></div>
      <div className="w-2.5 h-2.5 bg-purple-600 rounded-full animate-bounce shadow-lg" style={{ animationDelay: "150ms" }}></div>
      <div className="w-2.5 h-2.5 bg-orange-600 rounded-full animate-bounce shadow-lg" style={{ animationDelay: "300ms" }}></div>
    </div>
  );
};

// Progress bar loading
export const ProgressLoading = ({ progress = 0 }: { progress?: number }) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Loading...</span>
        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{progress}%</span>
      </div>
      <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 transition-all duration-500 ease-out rounded-full shadow-lg"
          style={{ width: `${progress}%` }}
        >
          <div className="h-full w-full bg-white/20 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};
