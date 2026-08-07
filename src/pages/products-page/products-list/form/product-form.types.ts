import { UNCATEGORIZED_CATEGORY_ID } from "@/features/categories/model/category.constants";
import type {
  ProductCharacteristicFormRow,
  SingleProductCharacteristicFormRow,
} from "./variants/product-add-variant.types";

export type ProductCreateFormValues = {
  name: string;
  description: string;
  status: "draft" | "active" | "archived";
  price: number;
  quantity: number;
  sku?: string;
  categoryId?: number;
  weightGrams?: number | null;
  lengthCm?: number | null;
  widthCm?: number | null;
  heightCm?: number | null;
};

export type ProductAddCharacteristicRow = ProductCharacteristicFormRow & {
  attributeId?: number;
};

export type ProductAddSingleCharacteristicRow =
  SingleProductCharacteristicFormRow & {
    attributeId?: number;
  };

export type ProductAddFormValues = ProductCreateFormValues & {
  characteristics: ProductAddCharacteristicRow[];
  singleCharacteristics: ProductAddSingleCharacteristicRow[];
  variants: unknown[];
};

export const defaultCreateValues: ProductCreateFormValues = {
  name: "",
  description: "",
  status: "active",
  price: 0,
  quantity: 0,
  sku: "",
  categoryId: UNCATEGORIZED_CATEGORY_ID,
  weightGrams: undefined,
  lengthCm: undefined,
  widthCm: undefined,
  heightCm: undefined,
};
