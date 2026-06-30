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
  categoryId?: number;
  weight_grams?: number | null;
  length_cm?: number | null;
  width_cm?: number | null;
  height_cm?: number | null;
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
  status: "draft",
  price: 0,
  quantity: 0,
  categoryId: undefined,
  weight_grams: undefined,
  length_cm: undefined,
  width_cm: undefined,
  height_cm: undefined,
};
