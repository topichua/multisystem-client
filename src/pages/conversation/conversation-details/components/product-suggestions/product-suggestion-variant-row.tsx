import { CheckIcon, HeartIcon, PlusIcon } from "@phosphor-icons/react";
import { Button, Flex, Space, Tag, Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import type {
  ConversationProductSuggestionProduct,
  ConversationProductSuggestionVariant,
} from "@/features/conversations/model/types";
import type { CatalogVariant } from "@/features/products/model/product.types";
import { VariantWishlistBadge } from "@/features/products/components/variant-wishlist-badge/variant-wishlist-badge";
import { formatCatalogVariantPrice } from "@/features/products/utils/catalog-variant-display";
import { useWishlistStore } from "@/features/wishlist/model/use-wishlist-store";
import { useNotification } from "@/shared/components/notification/use-notification";

import {
  getSuggestionVariantTitle,
  productSuggestionVariantToCatalogVariant,
} from "./product-suggestions.utils";
import * as S from "./product-suggestions-panel.styled";

const { Text } = Typography;

type ProductSuggestionVariantRowProps = {
  addedToOrder: boolean;
  clientId: number | null;
  conversationId: string;
  onAddToOrder: (variant: CatalogVariant) => void;
  product: ConversationProductSuggestionProduct;
  variant: ConversationProductSuggestionVariant;
};

export const ProductSuggestionVariantRow = observer(
  ({
    addedToOrder,
    clientId,
    conversationId,
    onAddToOrder,
    product,
    variant,
  }: ProductSuggestionVariantRowProps) => {
    const { t } = useTranslation();
    const notification = useNotification();
    const wishlistStore = useWishlistStore();
    const catalogVariant = useMemo(
      () => productSuggestionVariantToCatalogVariant(product, variant),
      [product, variant],
    );
    const title = getSuggestionVariantTitle(variant);
    const availableQuantity = variant.availableQuantity;
    const canAddToOrder = availableQuantity > 0 && variant.inStock;
    const orderDisabled = clientId == null || addedToOrder;
    const wishlistLoading =
      clientId != null && wishlistStore.isProductsLoading(clientId);
    const isInWishlist =
      clientId != null &&
      wishlistStore.isInWishlist(clientId, product.id, variant.id);
    const wishlistMutationLoading =
      clientId != null &&
      wishlistStore.isMutating(clientId, product.id, variant.id);
    const wishlistDisabled =
      clientId == null || wishlistLoading || isInWishlist;
    const numericConversationId = Number(conversationId);
    const wishlistPayloadConversationId =
      Number.isInteger(numericConversationId) && numericConversationId > 0
        ? numericConversationId
        : undefined;

    const handleAddToWishlist = async (): Promise<void> => {
      if (clientId == null || wishlistDisabled) {
        return;
      }

      try {
        await wishlistStore.addToWishlist(clientId, {
          productId: product.id,
          variantId: variant.id,
          ...(wishlistPayloadConversationId != null
            ? { conversationId: wishlistPayloadConversationId }
            : {}),
        });
      } catch (error) {
        notification.error({
          title: getApiErrorMessage(
            error,
            t("conversation.productSuggestions.wishlistAddFailed"),
          ),
        });
      }
    };

    return (
      <S.VariantRow>
        <S.VariantCopy>
          <Flex align="center" gap={6} wrap>
            <VariantWishlistBadge count={variant.wishlistCount} compact />
            <Text strong>{title}</Text>
          </Flex>

          <Space size={4} separator="·">
            <Text style={{ fontSize: 12 }} type="secondary">
              {formatCatalogVariantPrice(catalogVariant)}
            </Text>
            <Tag color={availableQuantity > 0 ? "green" : "red"}>
              {t("conversation.productSuggestions.quantityCount", {
                count: availableQuantity,
              })}
            </Tag>
          </Space>
        </S.VariantCopy>

        <S.VariantActions>
          {canAddToOrder ? (
            <Button
              color="primary"
              data-qa="layout-conversation-details-product-suggestions-add-to-order"
              disabled={orderDisabled}
              variant="filled"
              icon={
                addedToOrder ? <CheckIcon size={16} /> : <PlusIcon size={16} />
              }
              onClick={(event) => {
                event.stopPropagation();
                if (orderDisabled) {
                  return;
                }

                onAddToOrder(catalogVariant);
              }}
            >
              {addedToOrder
                ? t("conversation.productSuggestions.addedToOrder")
                : t("conversation.productSuggestions.addToOrder")}
            </Button>
          ) : (
            <Button
              danger
              data-qa="layout-conversation-details-product-suggestions-add-to-wishlist"
              disabled={wishlistDisabled}
              icon={<HeartIcon size={16} />}
              loading={wishlistMutationLoading}
              onClick={(event) => {
                event.stopPropagation();
                void handleAddToWishlist();
              }}
            >
              {isInWishlist
                ? t("conversation.productSuggestions.inWishlist")
                : t("conversation.productSuggestions.addToWishlist")}
            </Button>
          )}
        </S.VariantActions>
      </S.VariantRow>
    );
  },
);
