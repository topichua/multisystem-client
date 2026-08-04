import { HeartIcon } from "@phosphor-icons/react";
import { observer } from "mobx-react-lite";
import { useEffect, type MouseEventHandler } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components";

import { useWorkspaceSettingsStore } from "@/features/workspace-settings/model/use-workspace-settings-store";

import * as S from "./variant-wishlist-badge.styled";

type VariantWishlistBadgeProps = {
  count?: number | null;
  compact?: boolean;
  className?: string;
  interactive?: boolean;
  onClick?: MouseEventHandler<HTMLElement>;
};

export const VariantWishlistBadge = observer(
  ({
    count = 0,
    compact = false,
    className,
    interactive = false,
    onClick,
  }: VariantWishlistBadgeProps) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const workspaceSettingsStore = useWorkspaceSettingsStore();
    const safeCount = count ?? 0;
    const isInteractive = interactive && onClick != null;

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

    const ariaLabel = isInteractive
      ? t("products.variant.wishlistClients.openAria", { count: safeCount })
      : t("products.variant.wishlistCountAria", { count: safeCount });

    if (isInteractive) {
      return (
        <S.WishlistBadge
          as="button"
          type="button"
          className={className}
          $compact={compact}
          $interactive
          aria-label={ariaLabel}
          onClick={onClick}
        >
          <HeartIcon size={compact ? 12 : 14} color={colors.base.red[5]} />
          {safeCount}
        </S.WishlistBadge>
      );
    }

    return (
      <S.WishlistBadge
        className={className}
        $compact={compact}
        aria-label={ariaLabel}
      >
        <HeartIcon size={compact ? 12 : 14} color={colors.base.red[5]} />
        {safeCount}
      </S.WishlistBadge>
    );
  },
);
