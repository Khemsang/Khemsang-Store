import { useState, useCallback } from "react";

interface UseInfiniteScrollOptions<T> {
  fetchFn: (
    page: number,
    limit: number
  ) => Promise<{ data: T[]; total: number }>;
  limit?: number;
}

interface UseInfiniteScrollReturn<T> {
  items: T[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  reset: () => void;
  error: string | null;
}

function useInfiniteScroll<T>({
  fetchFn,
  limit = 12,
}: UseInfiniteScrollOptions<T>): UseInfiniteScrollReturn<T> {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const { data, total } = await fetchFn(page, limit);

      setItems((prev) => [...prev, ...data]);
      setPage((prev) => prev + 1);
      setHasMore(items.length + data.length < total);
    } catch (err: any) {
      setError(err.message || "Failed to load more items");
    } finally {
      setLoading(false);
    }
  }, [fetchFn, page, limit, loading, hasMore, items.length]);

  const reset = useCallback(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, []);

  return {
    items,
    loading,
    hasMore,
    loadMore,
    reset,
    error,
  };
}

export default useInfiniteScroll;
