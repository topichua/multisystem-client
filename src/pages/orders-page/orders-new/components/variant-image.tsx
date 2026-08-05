import { Image } from "antd";

import type { CatalogVariant } from "@/features/products/model/product.types";
import { resolveCatalogVariantImageSrc } from "@/features/products/utils/catalog-variant-display";

type VariantImageProps = {
  size?: number;
  variant: CatalogVariant;
};

export function VariantImage({ variant, size = 42 }: VariantImageProps) {
  return (
    <Image
      src={resolveCatalogVariantImageSrc(variant)}
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
