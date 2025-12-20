import { useEffect, useRef, ReactNode } from "react";

interface InfiniteScrollProps {
  children: ReactNode;
  loadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  threshold?: number;
  loader?: ReactNode;
  endMessage?: ReactNode;
}

const InfiniteScroll = ({
  children,
  loadMore,
  hasMore,
  loading,
  threshold = 200,
  loader,
  endMessage,
}: InfiniteScrollProps) => {
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { rootMargin: `${threshold}px` }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore, hasMore, loading, threshold]);

  const defaultLoader = (
    <div className="flex justify-center py-8">
      <div className="flex items-center gap-3">
        <svg
          className="animate-spin h-6 w-6 text-purple-600"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span className="text-gray-600 dark:text-gray-400 font-medium">
          Loading more...
        </span>
      </div>
    </div>
  );

  const defaultEndMessage = (
    <div className="text-center py-8">
      <p className="text-gray-500 dark:text-gray-400">
        You've reached the end! 🎉
      </p>
    </div>
  );

  return (
    <div>
      {children}

      {/* Observer target */}
      <div ref={observerRef} className="h-1" />

      {/* Loading indicator */}
      {loading && (loader || defaultLoader)}

      {/* End message */}
      {!hasMore && !loading && (endMessage || defaultEndMessage)}
    </div>
  );
};

export default InfiniteScroll;
