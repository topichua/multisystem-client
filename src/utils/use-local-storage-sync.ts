import { useEffect } from "react";
export function useLocalStorageSync(
  key: string,
  onSync: (newValue: string | null) => void,
): void {
  useEffect(() => {
    const handler = (event: StorageEvent) => {
      if (event.key !== key) return;
      onSync(event.newValue);
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [key, onSync]);
}
