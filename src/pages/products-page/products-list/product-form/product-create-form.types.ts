import type { Dispatch, SetStateAction } from "react";

import type {
  Product,
  ProductDetails,
  ProductVariantCreatePayload,
  ProductVariantDraft,
  ProductVariantUpdatePayload,
} from "@/features/products/model/product.types";

import type {
  ProductCreateFormValues,
  ProductEditFormValues,
} from "../product-modal.types";
import type { GalleryItem } from "./product-gallery";

export type CategoryOption = {
  value: number;
  label: string;
};

export type ProductFormMode = "create" | "edit";

export type ProductCreateFormProps = {
  mode?: ProductFormMode;
  product?: ProductDetails | null;
  categoryOptions: CategoryOption[];
  submitLoading: boolean;
  variantDeleteLoadingId?: number | null;
  onSubmit: (
    values: ProductCreateFormValues,
    coverImage?: File | null,
    variantDrafts?: ProductVariantDraft[],
    galleryImages?: File[],
    coverUrl?: string | null,
    galleryForVariants?: GalleryItem[],
  ) => Promise<Product | null>;
  onPatchProduct?: (
    field: keyof ProductEditFormValues,
    values: ProductEditFormValues,
  ) => Promise<boolean>;
  onPersistGallery?: (
    coverImage?: File | null,
    galleryImages?: File[],
    coverUrl?: string | null,
    remainingGalleryUrls?: string[],
  ) => Promise<boolean>;
  onCreateVariant?: (
    payload: ProductVariantCreatePayload,
    imageFile?: File | null,
  ) => Promise<void>;
  onUpdateVariant?: (
    variantId: number,
    payload: ProductVariantUpdatePayload,
    imageFile?: File | null,
  ) => Promise<void>;
  onDeleteVariant?: (variantId: number) => Promise<void>;
  onProductRefresh?: () => void | Promise<void>;
  aiToolsOpen: boolean;
  setAiToolsOpen: Dispatch<SetStateAction<boolean>>;
};
