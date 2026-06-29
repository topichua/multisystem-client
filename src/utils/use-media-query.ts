import { useCallback, useSyncExternalStore } from "react";

const MOBILE_VIEWPORT_QUERY = "(max-width: 767px)";

function getMediaQueryList(query: string): MediaQueryList | null {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return null;
  }

  return window.matchMedia(query);
}

export function useMediaQuery(query: string, defaultValue = false): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const mediaQueryList = getMediaQueryList(query);

      if (!mediaQueryList) {
        return () => undefined;
      }

      mediaQueryList.addEventListener("change", onStoreChange);

      return () => mediaQueryList.removeEventListener("change", onStoreChange);
    },
    [query],
  );

  const getSnapshot = useCallback(
    () => getMediaQueryList(query)?.matches ?? defaultValue,
    [defaultValue, query],
  );

  const getServerSnapshot = useCallback(() => defaultValue, [defaultValue]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useIsMobileViewport(): boolean {
  return useMediaQuery(MOBILE_VIEWPORT_QUERY);
}
