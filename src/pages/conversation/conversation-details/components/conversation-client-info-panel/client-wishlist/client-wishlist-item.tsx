import { XIcon } from "@phosphor-icons/react";
import { Image, Space, Spin, theme } from "antd";
import { observer } from "mobx-react-lite";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { Tag } from "@/components/tag/tag";
import type { CatalogVariant } from "@/features/products/model/product.types";
import {
  formatCatalogVariantPrice,
  getCatalogVariantImageUrl,
  getCatalogVariantMeta,
} from "@/features/products/utils/catalog-variant-display";
import { useWishlistStore } from "@/features/wishlist/model/use-wishlist-store";
import { useNotification } from "@/shared/components/notification/use-notification";

import * as S from "../conversation-client-info-panel.styled";

type ClientWishlistItemProps = {
  clientId: number;
  variant: CatalogVariant;
};

export const ClientWishlistItem = observer(function ClientWishlistItem({
  clientId,
  variant,
}: ClientWishlistItemProps) {
  const { t } = useTranslation();
  const notification = useNotification();
  const wishlistStore = useWishlistStore();
  const { token } = theme.useToken();
  const imageUrl = getCatalogVariantImageUrl(variant) ?? undefined;
  const meta = getCatalogVariantMeta(variant);
  const removing = wishlistStore.isMutating(
    clientId,
    variant.productId,
    variant.id,
  );

  const handleRemove = useCallback(async () => {
    if (removing) {
      return;
    }

    try {
      await wishlistStore.removeFromWishlist(clientId, {
        productId: variant.productId,
        variantId: variant.id,
      });
    } catch (error) {
      notification.error({
        title: getApiErrorMessage(
          error,
          t("conversation.clientProfile.wishlist.removeError"),
        ),
      });
    }
  }, [clientId, notification, removing, t, variant.id, variant.productId, wishlistStore]);

  return (
    <S.WishlistItemRow>
      <Image
        src={imageUrl}
        alt={variant.label}
        preview={false}
        width={40}
        height={40}
        style={{
          objectFit: "cover",
          borderRadius: token.borderRadiusSM,
          background: token.colorFillAlter,
          flexShrink: 0,
        }}
      />

      <S.WishlistItemCopy>
        <S.WishlistItemName>{variant.label}</S.WishlistItemName>
        <Space size={4} separator="·">
          {meta ? <S.WishlistItemMeta>{meta}</S.WishlistItemMeta> : null}
          <S.WishlistItemMeta>
            {formatCatalogVariantPrice(variant)}
          </S.WishlistItemMeta>
        </Space>
      </S.WishlistItemCopy>

      <Tag color="red">{t("conversation.clientProfile.wishlist.pending")}</Tag>

      <S.WishlistItemRemoveButton
        type="button"
        aria-label={t("conversation.clientProfile.wishlist.removeAria")}
        disabled={removing}
        onClick={() => {
          void handleRemove();
        }}
      >
        {removing ? <Spin size="small" /> : <XIcon size={16} />}
      </S.WishlistItemRemoveButton>
    </S.WishlistItemRow>
  );
});
