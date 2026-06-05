export type ProductVariantCreateDraftPayload = {
  color: string;
  size: string;
  price: number;
  inStock: boolean;
  quantity: number;
  imageUrl: string;
  sku: string;
};

export type ProductVariantDraft = ProductVariantCreateDraftPayload & {
  clientId: string;
  imageFile?: File | null;
};
