export type VariantFormValues = {
  color: string;
  size: string;
  price: number;
  quantity: number;
  inStock: boolean;
  sku?: string;
  imageUrl?: string;
  imageFile?: File | null;
};

export const defaultVariantFormValues: VariantFormValues = {
  color: "",
  size: "",
  price: 10,
  quantity: 1,
  inStock: true,
  sku: "",
  imageUrl: "",
  imageFile: null,
};
