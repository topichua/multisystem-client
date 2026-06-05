export const formatMoney = (
  value: number | null | undefined,
  currency = "UAH",
  emptyValue = "—",
): string => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return emptyValue;
  }

  try {
    return new Intl.NumberFormat("uk-UA", {
      style: "currency",
      currency,
      minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toLocaleString("uk-UA")} ${currency}`;
  }
};
