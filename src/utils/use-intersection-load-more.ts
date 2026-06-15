import { useEffect, useRef } from "react";

type UseIntersectionLoadMoreOptions = {
  enabled: boolean;
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  rootMargin?: string;
};

export function useIntersectionLoadMore({
  enabled,
  hasMore,
  loading,
  onLoadMore,
  rootMargin = "240px",
}: UseIntersectionLoadMoreOptions) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const onLoadMoreRef = useRef(onLoadMore);
  const loadingRef = useRef(loading);

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
    loadingRef.current = loading;
  }, [loading, onLoadMore]);

  useEffect(() => {
    if (!enabled || !hasMore) {
      return;
    }

    const sentinel = sentinelRef.current;

    if (!sentinel) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (entry?.isIntersecting && !loadingRef.current) {
          onLoadMoreRef.current();
        }
      },
      { rootMargin },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [enabled, hasMore, rootMargin]);

  return sentinelRef;
}
