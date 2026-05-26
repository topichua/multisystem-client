export const VARIANT_DRAFT_TABLE_COLUMN_WIDTHS = {
  image: 88,
  color: 120,
  size: 100,
  price: 140,
  quantity: 88,
  inStock: 96,
  actions: 100,
} as const;

export const VARIANT_DRAFT_TABLE_SCROLL_X = Object.values(
  VARIANT_DRAFT_TABLE_COLUMN_WIDTHS,
).reduce((total, width) => total + width, 0);

export const variantDraftCellFieldStyle = {
  width: "100%",
  maxWidth: "100%",
} as const;
