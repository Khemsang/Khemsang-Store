import { useEffect, useState } from 'react';

/**
 * Hook to ensure loading state shows for a minimum duration
 * @param isLoading - The actual loading state from data fetching
 * @param minDuration - Minimum duration in milliseconds (default: 1000ms)
 * @returns boolean - Whether to show loading state
 */
export const useMinimumLoading = (isLoading: boolean, minDuration: number = 1000): boolean => {
  const [showLoading, setShowLoading] = useState(true);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (!isLoading) {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minDuration - elapsed);

      if (remaining > 0) {
        const timer = setTimeout(() => {
          setShowLoading(false);
        }, remaining);

        return () => clearTimeout(timer);
      } else {
        setShowLoading(false);
      }
    }
  }, [isLoading, minDuration, startTime]);

  return showLoading;
};
