import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";

import { readProductsListFocusVariantId } from "@/features/products/model/products-list-url";

import {
  PRODUCT_VARIANT_ANCHOR_ATTR,
  PRODUCT_VARIANT_SCROLL_HIGHLIGHT_MS,
} from "./scroll-to-product-variant";

const RETRY_DELAYS_MS = [0, 100, 300] as const;

export function useFocusProductVariantFromNavigation(
  enabled: boolean,
): number | null {
  const location = useLocation();
  const [highlightedVariantId, setHighlightedVariantId] = useState<
    number | null
  >(null);
  const handledFocusKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (highlightedVariantId == null) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setHighlightedVariantId((current) =>
        current === highlightedVariantId ? null : current,
      );
    }, PRODUCT_VARIANT_SCROLL_HIGHLIGHT_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [highlightedVariantId]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const focusVariantId = readProductsListFocusVariantId(location.state);
    if (focusVariantId == null) {
      return;
    }

    const focusKey = `${location.key}:${focusVariantId}`;
    if (handledFocusKeyRef.current === focusKey) {
      return;
    }

    let cancelled = false;
    const timeoutIds: number[] = [];

    const tryFocus = (): boolean => {
      if (cancelled || handledFocusKeyRef.current === focusKey) {
        return false;
      }

      const el = document.querySelector<HTMLElement>(
        `[${PRODUCT_VARIANT_ANCHOR_ATTR}="${focusVariantId}"]`,
      );

      if (el == null) {
        return false;
      }

      handledFocusKeyRef.current = focusKey;
      setHighlightedVariantId(focusVariantId);
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      return true;
    };

    for (const delayMs of RETRY_DELAYS_MS) {
      timeoutIds.push(window.setTimeout(() => void tryFocus(), delayMs));
    }

    return () => {
      cancelled = true;
      for (const timeoutId of timeoutIds) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [enabled, location.key, location.state]);

  return highlightedVariantId;
}
