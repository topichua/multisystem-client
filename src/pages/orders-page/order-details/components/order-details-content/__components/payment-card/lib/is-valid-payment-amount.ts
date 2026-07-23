export function isValidPaymentAmount(
  amount: number | null,
  remainingAmount: number | null,
): amount is number {
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    return false;
  }

  if (
    typeof remainingAmount === "number" &&
    Number.isFinite(remainingAmount) &&
    amount > remainingAmount
  ) {
    return false;
  }

  return true;
}
