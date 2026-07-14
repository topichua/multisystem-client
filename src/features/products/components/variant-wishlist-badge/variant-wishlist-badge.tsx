import { HeartIcon } from "@phosphor-icons/react";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components";

import { useWorkspaceSettingsStore } from "@/features/workspace-settings/model/use-workspace-settings-store";

import * as S from "./variant-wishlist-badge.styled";

type VariantWishlistBadgeProps = {
  count?: number | null;
  compact?: boolean;
  className?: string;
};

export const VariantWishlistBadge = observer(
  ({ count = 0, compact = false, className }: VariantWishlistBadgeProps) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const workspaceSettingsStore = useWorkspaceSettingsStore();
    const safeCount = count ?? 0;

    useEffect(() => {
      if (
        !workspaceSettingsStore.initialized &&
        !workspaceSettingsStore.loadLoading
      ) {
        void workspaceSettingsStore.loadSettings({ silent: true });
      }
    }, [workspaceSettingsStore]);

    if (!workspaceSettingsStore.wishlistEnabled) {
      return null;
    }

    return (
      <S.WishlistBadge
        className={className}
        $compact={compact}
        aria-label={t("products.variant.wishlistCountAria", {
          count: safeCount,
        })}
      >
        <HeartIcon size={compact ? 12 : 14} color={colors.base.red[5]} />
        {safeCount}
      </S.WishlistBadge>
    );
  },
);
