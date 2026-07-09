import { Image } from "antd";

import type { CatalogVariant } from "@/features/products/model/product.types";
import { getCatalogVariantImageUrl } from "@/features/products/utils/catalog-variant-display";

import * as S from "../orders-new-page.styled";

type VariantImageProps = {
  size?: number;
  variant: CatalogVariant;
};

export function VariantImage({ variant, size = 42 }: VariantImageProps) {
  const imageUrl = getCatalogVariantImageUrl(variant) ?? undefined;

  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={variant.label}
        preview={false}
        width={size}
        height={size}
        style={{
          objectFit: "cover",
          borderRadius: 8,
          flexShrink: 0,
        }}
      />
    );
  }

  return <S.ProductImagePlaceholder aria-hidden="true" $size={size} />;
}
