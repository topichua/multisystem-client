import type { MouseEvent } from "react";
import { observer } from "mobx-react-lite";

import { VariantWishlistBadge } from "@/features/products/components/variant-wishlist-badge/variant-wishlist-badge";
import { useVariantWishlistClientsStore } from "@/features/wishlist/model/use-variant-wishlist-clients-store";

type InteractiveVariantWishlistBadgeProps = {
  count?: number | null;
  compact?: boolean;
  className?: string;
  productId: number;
  variantId: number;
  subtitle?: string | null;
};

export const InteractiveVariantWishlistBadge = observer(
  function InteractiveVariantWishlistBadge({
    count = 0,
    compact = false,
    className,
    productId,
    variantId,
    subtitle,
  }: InteractiveVariantWishlistBadgeProps) {
    const store = useVariantWishlistClientsStore();
    const safeCount = count ?? 0;
    const canOpen = safeCount > 0 && productId > 0 && variantId > 0;

    const handleClick = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (!canOpen) {
        return;
      }

      store.openDrawer({
        productId,
        variantId,
        subtitle,
      });
    };

    return (
      <VariantWishlistBadge
        className={className}
        compact={compact}
        count={safeCount}
        interactive={canOpen}
        onClick={canOpen ? handleClick : undefined}
      />
    );
  },
);
