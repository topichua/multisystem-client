import { useCallback, useEffect, useState } from "react";

import { SEARCH_DEBOUNCE_MS } from "./constants";
import type { RemoteSelectState, UseRemoteSelectOptions } from "./types";

function isAbortError(error: unknown): boolean {
  if (error instanceof DOMException && error.name === "AbortError") {
    return true;
  }

  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ERR_CANCELED"
  );
}

export function useRemoteSelect<TOption>({
  enabled,
  minSearchLength = 0,
  loadOptions,
}: UseRemoteSelectOptions<TOption>): RemoteSelectState<TOption> {
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<TOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const keyword = search.trim();

    if (!enabled || keyword.length < minSearchLength) {
      return;
    }

    const abortController = new AbortController();
    let disposed = false;
    const timerId = window.setTimeout(() => {
      setLoading(true);
      setFailed(false);

      void loadOptions(keyword, abortController.signal)
        .then((nextOptions) => {
          if (!disposed && !abortController.signal.aborted) {
            setOptions(nextOptions);
          }
        })
        .catch((error) => {
          if (
            !disposed &&
            !abortController.signal.aborted &&
            !isAbortError(error)
          ) {
            setOptions([]);
            setFailed(true);
          }
        })
        .finally(() => {
          if (!disposed && !abortController.signal.aborted) {
            setLoading(false);
          }
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      disposed = true;
      abortController.abort();
      window.clearTimeout(timerId);
    };
  }, [enabled, loadOptions, minSearchLength, search]);

  const updateSearch = useCallback(
    (value: string) => {
      const keyword = value.trim();

      setSearch(value);

      if (!enabled || keyword.length < minSearchLength) {
        setOptions([]);
        setLoading(false);
        setFailed(false);
      }
    },
    [enabled, minSearchLength],
  );

  const clear = useCallback(() => {
    setSearch("");
    setOptions([]);
    setLoading(false);
    setFailed(false);
  }, []);

  const clearSearch = useCallback(() => {
    setSearch("");
  }, []);

  return {
    options,
    loading,
    failed,
    search,
    setSearch: updateSearch,
    clearSearch,
    clear,
  };
}
