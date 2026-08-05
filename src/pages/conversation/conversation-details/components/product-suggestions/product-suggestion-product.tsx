import { Avatar, Collapse, Empty, Flex, Typography } from "antd";
import { useTranslation } from "react-i18next";

import type { ConversationProductSuggestionProduct } from "@/features/conversations/model/types";
import type { CatalogVariant } from "@/features/products/model/product.types";
import { resolveProductImageSrc } from "@/features/products/utils/product-display";

import { ProductSuggestionVariantRow } from "./product-suggestion-variant-row";
import {
  getSuggestionProductAvailableQuantity,
  getSuggestionProductImageUrl,
} from "./product-suggestions.utils";
import * as S from "./product-suggestions-panel.styled";

const { Text } = Typography;

type ProductSuggestionProductProps = {
  active: boolean;
  clientId: number | null;
  conversationId: string;
  orderDraftVariantIds: Set<number>;
  product: ConversationProductSuggestionProduct;
  onAddToOrder: (variant: CatalogVariant) => void;
  onOpenChange: (open: boolean) => void;
};

export function ProductSuggestionProduct({
  active,
  clientId,
  conversationId,
  orderDraftVariantIds,
  onAddToOrder,
  product,
  onOpenChange,
}: ProductSuggestionProductProps) {
  const { t } = useTranslation();
  const imageUrl = resolveProductImageSrc(getSuggestionProductImageUrl(product));
  const meta = [
    t("conversation.productSuggestions.variantCount", {
      count: product.variants.length,
    }),
    t("conversation.productSuggestions.quantityCount", {
      count: getSuggestionProductAvailableQuantity(product),
    }),
  ].join(" · ");
  const productKey = String(product.id);

  return (
    <S.ProductCollapse>
      <Collapse
        activeKey={active ? [productKey] : []}
        ghost
        expandIconPlacement="end"
        onChange={(key) => {
          const keys = Array.isArray(key) ? key : [key];
          onOpenChange(keys.includes(productKey));
        }}
        items={[
          {
            key: productKey,
            label: (
              <Flex align="center" gap={12} style={{ minWidth: 0 }}>
                <Avatar
                  shape="square"
                  size={36}
                  src={imageUrl}
                  style={{ flexShrink: 0 }}
                />

                <Flex vertical gap={2} style={{ minWidth: 0 }}>
                  <Text strong ellipsis>
                    {product.name}
                  </Text>
                  <Flex align="center" gap={6} wrap>
                    <S.ProductMeta>{meta}</S.ProductMeta>
                  </Flex>
                </Flex>
              </Flex>
            ),
            children:
              product.variants.length > 0 ? (
                <Flex vertical gap={4}>
                  {product.variants.map((variant) => (
                    <ProductSuggestionVariantRow
                      key={variant.id}
                      clientId={clientId}
                      conversationId={conversationId}
                      addedToOrder={orderDraftVariantIds.has(variant.id)}
                      onAddToOrder={onAddToOrder}
                      product={product}
                      variant={variant}
                    />
                  ))}
                </Flex>
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={t(
                    "conversation.productSuggestions.emptyVariants",
                  )}
                />
              ),
          },
        ]}
      />
    </S.ProductCollapse>
  );
}
