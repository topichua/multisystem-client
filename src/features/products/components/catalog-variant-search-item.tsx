import { Flex, Image, Typography, theme } from "antd";
import { useTranslation } from "react-i18next";

import type { CatalogVariant } from "@/features/products/model/product.types";
import {
  formatCatalogVariantPrice,
  getCatalogVariantImageUrl,
  getCatalogVariantMeta,
} from "@/features/products/utils/catalog-variant-display";

const { Text } = Typography;

type CatalogVariantSearchItemProps = {
  variant: CatalogVariant;
};

export const CatalogVariantSearchItem = ({
  variant,
}: CatalogVariantSearchItemProps) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const imageUrl = getCatalogVariantImageUrl(variant) ?? undefined;
  const meta = getCatalogVariantMeta(variant);
  const priceLabel = formatCatalogVariantPrice(variant);
  const stockLabel = variant.inStock
    ? t("products.catalogVariant.inStock", {
        count: variant.quantity,
      })
    : t("products.catalogVariant.outOfStock");

  return (
    <Flex align="center" gap={12} style={{ padding: 0 }}>
      <Image
        src={imageUrl}
        alt={variant.label}
        preview={false}
        width={48}
        height={40}
        style={{
          objectFit: "cover",
          borderRadius: token.borderRadius,
          background: token.colorFillAlter,
          flexShrink: 0,
        }}
      />

      <Flex vertical gap={2} style={{ flex: 1, minWidth: 0 }}>
        <Text strong ellipsis>
          {variant.label}
        </Text>
        <Text type="secondary" ellipsis>
          {[meta, priceLabel, stockLabel].filter(Boolean).join(" · ")}
        </Text>
      </Flex>
    </Flex>
  );
};
