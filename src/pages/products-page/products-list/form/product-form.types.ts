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
};
