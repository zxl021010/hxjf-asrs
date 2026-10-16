import { useEffect, useRef } from 'react';

interface UseInfiniteScrollOptions {
  readonly hasMore: boolean;
  readonly loading: boolean;
  readonly onLoadMore: () => void;
}

interface UseInfiniteScrollReturn {
  readonly sentinelRef: React.RefObject<HTMLDivElement>;
}

export function useInfiniteScroll(options: UseInfiniteScrollOptions): UseInfiniteScrollReturn {
  const { hasMore, loading, onLoadMore } = options;
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    if (!hasMore || loading || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMoreRef.current();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinelRef.current);
    observerRef.current = observer;

    return () => observer.disconnect();
  }, [hasMore, loading]);

  return { sentinelRef };
}
