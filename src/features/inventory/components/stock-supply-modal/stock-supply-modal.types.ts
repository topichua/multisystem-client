import type { CatalogVariant } from "@/features/products/model/product.types";

export type StockSupplyModalProps = {
  open: boolean;
  supplyId?: number | null;
  onClose: () => void;
  onSuccess?: () => Promise<void> | void;
};

export type SupplyPickerMode = "flat" | "grouped";

export type SupplyLine = {
  variant: CatalogVariant;
  quantity: number | null;
  buyPrice: number | null;
};

export type VariantGroup = {
  key: string;
  productName: string;
  variants: CatalogVariant[];
};

export type StockSupplySubmitAction = "create" | "save" | "apply" | "delete";
