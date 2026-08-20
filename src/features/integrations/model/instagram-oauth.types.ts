export type InstagramOAuthPage = {
  pageId: string;
  pageName: string;
  instagramAccountId?: string;
};

export type InstagramOAuthSessionStatus =
  "awaiting_instagram" | "select_page" | "connected" | "failed" | (string & {});

export type InstagramOAuthPagesResponse = {
  status: InstagramOAuthSessionStatus;
  sessionId: string;
  pages: InstagramOAuthPage[];
  expiresAt?: string;
  error?: string;
};

export type InstagramOAuthConfirmPayload = {
  sessionId: string;
  pageId: string;
};

export type InstagramOAuthConfirmResponse = {
  ok?: boolean;
  integration?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value != null;
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function parsePages(value: unknown): InstagramOAuthPage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!isRecord(item)) {
      return [];
    }

    const pageId =
      readString(item.pageId) ??
      readString(item.page_id) ??
      readString(item.id);
    const pageName =
      readString(item.pageName) ??
      readString(item.page_name) ??
      readString(item.name) ??
      pageId;

    if (pageId == null || pageName == null) {
      return [];
    }

    const instagramAccountId =
      readString(item.instagramAccountId) ??
      readString(item.instagram_account_id) ??
      undefined;

    return [
      {
        pageId,
        pageName,
        ...(instagramAccountId ? { instagramAccountId } : {}),
      },
    ];
  });
}

export function parseInstagramOAuthPagesResponse(
  data: unknown,
  fallbackSessionId?: string,
): InstagramOAuthPagesResponse | null {
  if (Array.isArray(data)) {
    if (!fallbackSessionId) {
      return null;
    }

    return {
      status: "select_page",
      sessionId: fallbackSessionId,
      pages: parsePages(data),
    };
  }

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

  const status =
    readString(data.status) ??
    readString(data.nextStep) ??
    readString(data.next_step) ??
    (parsePages(data.pages).length > 0 ? "select_page" : "awaiting_instagram");

  return {
    status,
    sessionId,
    pages: parsePages(data.pages),
    expiresAt:
      readString(data.expiresAt) ?? readString(data.expires_at) ?? undefined,
    error:
      readString(data.error) ??
      readString(data.message) ??
      readString(data.errorMessage) ??
      undefined,
  };
}
