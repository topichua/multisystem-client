export function normalizeOrderDiscountPercent(
  value: number | null | undefined,
): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, value));
}

export function calculateOrderDiscountAmount(
  subtotal: number,
  discountPercent: number,
): number {
  const normalizedPercent = normalizeOrderDiscountPercent(discountPercent);

  return (subtotal * normalizedPercent) / 100;
}
