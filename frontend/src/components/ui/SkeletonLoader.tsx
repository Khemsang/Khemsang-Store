interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "rounded";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
}

const Skeleton = ({
  className = "",
  variant = "rectangular",
  width,
  height,
  animation = "pulse",
}: SkeletonProps) => {
  const baseClasses = "bg-gray-200 dark:bg-gray-700";

  const variantClasses = {
    text: "rounded",
    circular: "rounded-full",
    rectangular: "",
    rounded: "rounded-xl",
  };

  const animationClasses = {
    pulse: "animate-pulse",
    wave: "animate-shimmer",
    none: "",
  };

  const style: React.CSSProperties = {
    width: width,
    height: height,
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  );
};

// Product Card Skeleton
export const ProductCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg">
    <Skeleton variant="rectangular" className="w-full h-64" />
    <div className="p-4 space-y-3">
      <Skeleton variant="text" className="h-4 w-3/4" />
      <Skeleton variant="text" className="h-4 w-1/2" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton variant="text" className="h-6 w-24" />
        <Skeleton variant="circular" className="w-10 h-10" />
      </div>
    </div>
  </div>
);

// Product Grid Skeleton
export const ProductGridSkeleton = ({ count = 8 }: { count?: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {[...Array(count)].map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

// Product Detail Skeleton
export const ProductDetailSkeleton = () => (
  <div className="grid md:grid-cols-2 gap-8">
    <div className="space-y-4">
      <Skeleton variant="rounded" className="w-full aspect-square" />
      <div className="flex gap-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} variant="rounded" className="w-20 h-20" />
        ))}
      </div>
    </div>
    <div className="space-y-4">
      <Skeleton variant="text" className="h-8 w-3/4" />
      <Skeleton variant="text" className="h-6 w-1/4" />
      <Skeleton variant="text" className="h-10 w-1/3" />
      <div className="space-y-2">
        <Skeleton variant="text" className="h-4 w-full" />
        <Skeleton variant="text" className="h-4 w-full" />
        <Skeleton variant="text" className="h-4 w-2/3" />
      </div>
      <div className="flex gap-2 pt-4">
        <Skeleton variant="rounded" className="h-12 w-32" />
        <Skeleton variant="rounded" className="h-12 flex-1" />
      </div>
    </div>
  </div>
);

// Table Row Skeleton
export const TableRowSkeleton = ({ columns = 5 }: { columns?: number }) => (
  <tr>
    {[...Array(columns)].map((_, i) => (
      <td key={i} className="px-4 py-3">
        <Skeleton variant="text" className="h-4 w-full" />
      </td>
    ))}
  </tr>
);

// Order Card Skeleton
export const OrderCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg space-y-4">
    <div className="flex justify-between">
      <Skeleton variant="text" className="h-5 w-32" />
      <Skeleton variant="rounded" className="h-6 w-24" />
    </div>
    <div className="flex gap-4">
      <Skeleton variant="rounded" className="w-20 h-20" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" className="h-4 w-3/4" />
        <Skeleton variant="text" className="h-4 w-1/2" />
      </div>
    </div>
    <div className="flex justify-between pt-2">
      <Skeleton variant="text" className="h-6 w-24" />
      <Skeleton variant="rounded" className="h-10 w-28" />
    </div>
  </div>
);

export default Skeleton;
