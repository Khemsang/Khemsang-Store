import { useEffect } from 'react';

/**
 * Hook to scroll to top when a dependency changes (like page number)
 * @param trigger - The value that triggers scroll (usually currentPage)
 * @param behavior - Scroll behavior: 'smooth' or 'auto' (default: 'smooth')
 */
export const useScrollToTop = (trigger: any, behavior: ScrollBehavior = 'smooth') => {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior,
    });
  }, [trigger, behavior]);
};
