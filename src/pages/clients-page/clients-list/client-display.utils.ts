import type {
  Client,
  ClientOrderStats,
} from "@/features/clients/model/client.types";
import { formatDate } from "@/utils/date-time";

export function formatClientDisplayName(
  client: Pick<Client, "firstName" | "lastName">,
): string {
  const parts = [client.firstName, client.lastName]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part));

  return parts.join(" ") || "—";
}

export function getClientInitials(
  client: Pick<Client, "firstName" | "lastName">,
): string {
  const first = client.firstName?.trim();
  const last = client.lastName?.trim();

  if (first && last) {
    return `${first[0]}${last[0]}`.toUpperCase();
  }

  if (first) {
    return first.slice(0, 2).toUpperCase();
  }

  if (last) {
    return last.slice(0, 2).toUpperCase();
  }

  return "?";
}

export function hasClientInstagramSource(client: Client): boolean {
  return (client.instagramUserIds?.length ?? 0) > 0;
}

export function hasClientTelegramSource(client: Client): boolean {
  return (client.telegramUserIds?.length ?? 0) > 0;
}

export function formatClientUahAmount(
  amount: number | null | undefined,
): string {
  if (amount == null || Number.isNaN(amount)) {
    return "—";
  }

  return `${amount.toLocaleString("uk-UA")} ₴`;
}

export function formatClientDate(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }

  return formatDate(value) || "—";
}

export function getClientOrderStats(
  client: Client,
): ClientOrderStats | undefined {
  return client.orderStats;
}
