import { Flex, Image, Typography, theme } from "antd";

import type { CatalogVariant } from "@/features/products/model/product.types";

const { Text } = Typography;

type CatalogVariantSearchItemProps = {
  variant: CatalogVariant;
};

export const CatalogVariantSearchItem = ({
  variant,
}: CatalogVariantSearchItemProps) => {
  const { token } = theme.useToken();
  const product = variant.product;
  const imageUrl = variant.imageUrl ?? product?.mainImageUrl ?? undefined;
  const meta = [variant.color, variant.size].filter(Boolean).join(" / ");
  const currency =
    product?.currency === "UAH" ? "₴" : (product?.currency ?? "");

  return (
    <Flex align="center" gap={12} style={{ padding: "4px 0" }}>
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
        {meta ? (
          <Text type="secondary" ellipsis>
            {meta}
          </Text>
        ) : null}
        <Text type="secondary">
          {variant.unitPrice.toLocaleString("uk-UA")} {currency}
          {variant.inStock
            ? ` · ${variant.quantity} шт.`
            : " · немає в наявності"}
        </Text>
      </Flex>
    </Flex>
  );
};
