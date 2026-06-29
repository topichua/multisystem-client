import type { Client } from "@/features/clients/model/client.types";

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
