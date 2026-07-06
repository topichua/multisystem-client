import type { Client } from "@/features/clients/model/client.types";

export type ClientDetailsLocationState = {
  client?: Client;
};

export function coerceClientId(value: string | undefined): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export function readClientFromLocationState(
  state: unknown,
  expectedClientId?: number,
): Client | undefined {
  if (!state || typeof state !== "object") {
    return undefined;
  }

  const client = (state as ClientDetailsLocationState).client;

  if (!client || typeof client.id !== "number") {
    return undefined;
  }

  if (expectedClientId != null && client.id !== expectedClientId) {
    return undefined;
  }

  return client;
}
