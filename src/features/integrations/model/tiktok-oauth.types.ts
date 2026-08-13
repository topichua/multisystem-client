export type TikTokOAuthSessionStatus =
  "awaiting_tiktok" | "connected" | "failed" | (string & {});

export type TikTokOAuthStatusResponse = {
  sessionId: string;
  status: TikTokOAuthSessionStatus;
  integrationId?: number;
  expiresAt?: string;
  error?: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value != null;
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

export function parseTikTokOAuthStatusResponse(
  data: unknown,
  fallbackSessionId?: string,
): TikTokOAuthStatusResponse | null {
  if (!isRecord(data)) {
    return null;
  }

  const sessionId =
    readString(data.sessionId) ??
    readString(data.session_id) ??
    fallbackSessionId ??
    null;

  if (sessionId == null) {
    return null;
  }

  const status = readString(data.status);

  if (status == null) {
    return null;
  }

  const error =
    readString(data.error) ??
    readString(data.message) ??
    readString(data.errorMessage) ??
    null;

  return {
    sessionId,
    status,
    integrationId:
      readNumber(data.integrationId) ?? readNumber(data.integration_id),
    expiresAt:
      readString(data.expiresAt) ?? readString(data.expires_at) ?? undefined,
    error,
  };
}
