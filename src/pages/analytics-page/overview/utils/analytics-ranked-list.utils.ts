export function getRankedListPercent(value: number, maxValue: number): number {
  if (!Number.isFinite(value) || value <= 0 || maxValue <= 0) {
    return 0;
  }

  return Math.max(4, Math.round((value / maxValue) * 100));
}

const CUSTOMER_AVATAR_COLORS = [
  "#2DA68B",
  "#6E62CD",
  "#E4405F",
  "#2372E2",
  "#DEA838",
  "#8D59DC",
] as const;

export function getCustomerAvatarColor(name: string): string {
  let hash = 0;

  for (const char of name) {
    hash = char.charCodeAt(0) + ((hash << 5) - hash);
  }

  return CUSTOMER_AVATAR_COLORS[Math.abs(hash) % CUSTOMER_AVATAR_COLORS.length];
}

export function getPersonInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
}
