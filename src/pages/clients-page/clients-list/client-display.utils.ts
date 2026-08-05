import type {
  Client,
  ClientOrderStats,
} from "@/features/clients/model/client.types";

export function formatClientDisplayName(
  client: Pick<Client, "firstName" | "lastName">,
): string {
  const parts = [client.firstName, client.lastName]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part));

  return parts.join(" ") || "—";
}

export function hasClientInstagramSource(client: Client): boolean {
  return (client.instagramUserIds?.length ?? 0) > 0;
}

export function hasClientTelegramSource(client: Client): boolean {
  return (client.telegramUserIds?.length ?? 0) > 0;
}

export function hasClientManualSource(client: Client): boolean {
  return !hasClientInstagramSource(client) && !hasClientTelegramSource(client);
}

export function formatClientSocialUsernames(client: Client): string {
  return [...(client.telegramUsers ?? []), ...(client.instagramUsers ?? [])]
    .map((user) => {
      const username = user.username?.trim();

      if (username) {
        return username.startsWith("@") ? username : `@${username}`;
      }

      return user.id?.trim() || null;
    })
    .filter((value): value is string => Boolean(value))
    .join(", ");
}

export function formatClientUahAmount(
  amount: number | null | undefined,
): string {
  if (amount == null || Number.isNaN(amount)) {
    return "—";
  }

  return `${amount.toLocaleString("uk-UA")} ₴`;
}

export function getClientOrderStats(
  client: Client,
): ClientOrderStats | undefined {
  return client.orderStats;
}
