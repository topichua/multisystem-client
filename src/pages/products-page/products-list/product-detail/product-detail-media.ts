import type {
  ProductDetails,
  ProductMediaItem,
} from "@/features/products/model/product.types";

export const filterProductMediaItems = (
  product: ProductDetails | null,
): ProductMediaItem[] => {
  if (!product?.media || !Array.isArray(product.media)) {
    return [];
  }
  return product.media.filter((item): item is ProductMediaItem =>
    Boolean(
      item &&
      typeof item === "object" &&
      "url" in item &&
      typeof (item as ProductMediaItem).url === "string",
    ),
  );
};
