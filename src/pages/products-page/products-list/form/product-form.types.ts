import type { ProductDetails } from "@/features/products/model/product.types";

export type ProductCreateFormValues = {
  name: string;
  description: string;
  status: "draft" | "active" | "archived";
  sourceType: string;
  sourceId: string;
  referenceGroupId: string;
  price: number;
  quantity: number;
  mediaUrl: string;
  categoryId?: number;
};

export type ProductEditFormValues = {
  name: string;
  description: string;
  status: string;
  sourceType: string;
  sourceId: string;
  referenceGroupId: string;
  price?: number;
  currency: string;
  inStock: boolean;
  quantity?: number;
  categoryId?: number;
};

export const defaultCreateValues: ProductCreateFormValues = {
  name: "",
  description: "",
  status: "draft",
  sourceType: "manual",
  sourceId: "",
  referenceGroupId: "",
  price: 0,
  quantity: 0,
  mediaUrl: "",
  categoryId: undefined,
};

export const productToCreateValues = (
  product: ProductDetails,
): ProductCreateFormValues => ({
  name: product.name,
  description: product.description ?? "",
  status: (product.status as ProductCreateFormValues["status"]) || "draft",
  sourceType: product.sourceType ?? "manual",
  sourceId: product.sourceId ?? "",
  referenceGroupId:
    product.referenceGroupId == null ? "" : String(product.referenceGroupId),
  price: product.price ?? 0,
  quantity: product.quantity ?? 0,
  mediaUrl: product.mainImageUrl ?? "",
  categoryId: product.categoryId ?? undefined,
});

export const productToEditValues = (
  product: ProductDetails,
): ProductEditFormValues => ({
  name: product.name,
  description: product.description ?? "",
  status: product.status,
  sourceType: product.sourceType ?? "manual",
  sourceId: product.sourceId ?? "",
  referenceGroupId:
    product.referenceGroupId == null ? "" : String(product.referenceGroupId),
  price: product.price ?? undefined,
  currency: product.currency || "UAH",
  inStock: product.inStock ?? false,
  quantity: product.quantity ?? undefined,
  categoryId: product.categoryId ?? undefined,
});
