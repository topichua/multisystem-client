import type {
  InstagramIntegration,
  InstagramComment,
  InstagramCommentAuthor,
  InstagramCommentsPage,
  InstagramMediaChild,
  InstagramMediaItem,
  InstagramMediaPage,
  InstagramMediaPaging,
  InstagramProductReferences,
} from "./instagram.types";

type ParsedId = string | number;

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const readId = (v: unknown): ParsedId | null => {
  if (typeof v === "string" && v.trim() !== "") {
    return v;
  }

  if (typeof v === "number" && Number.isFinite(v)) {
    return v;
  }

  return null;
};

const readString = (v: unknown): string | null =>
  typeof v === "string" && v.trim() !== "" ? v : null;

const readNumber = (v: unknown): number | undefined => {
  if (typeof v === "number" && Number.isFinite(v)) {
    return v;
  }

  if (typeof v === "string" && v.trim() !== "") {
    const parsed = Number(v);

    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
};

const unwrapPayload = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (isRecord(payload)) {
    if (Array.isArray(payload.items)) {
      return payload.items;
    }

    if (Array.isArray(payload.data)) {
      return payload.data;
    }

    if (Array.isArray(payload.pairs)) {
      return payload.pairs;
    }
  }

  return [];
};

const parseInstagramIntegration = (
  raw: unknown,
): InstagramIntegration | null => {
  if (!isRecord(raw)) {
    return null;
  }

  const integrationId = readId(
    raw.integration_id ?? raw.integrationId ?? raw.id,
  );
  const businessAccountId = readId(
    raw.business_account_id ?? raw.businessAccountId,
  );

  if (integrationId == null || businessAccountId == null) {
    return null;
  }

  const name =
    readString(raw.name) ??
    readString(raw.page_name) ??
    readString(raw.pageName) ??
    readString(raw.business_account_name) ??
    readString(raw.businessAccountName) ??
    readString(raw.username) ??
    `Instagram ${String(businessAccountId)}`;

  return {
    integration_id: integrationId,
    business_account_id: String(businessAccountId),
    name,
    username:
      readString(raw.username ?? raw.business_account_username) ?? undefined,
    media_count: readNumber(raw.media_count ?? raw.mediaCount),
    followers_count: readNumber(raw.followers_count ?? raw.followersCount),
  };
};

export const parseInstagramIntegrationsResponse = (
  payload: unknown,
): InstagramIntegration[] =>
  unwrapPayload(payload).reduce<InstagramIntegration[]>((acc, item) => {
    const parsed = parseInstagramIntegration(item);

    if (parsed) {
      acc.push(parsed);
    }

    return acc;
  }, []);

const parseMediaChild = (raw: unknown): InstagramMediaChild | null => {
  if (!isRecord(raw)) {
    return null;
  }

  const id = readId(raw.id);
  const mediaType = readString(raw.media_type ?? raw.mediaType);

  if (id == null || mediaType == null) {
    return null;
  }

  return {
    id: String(id),
    media_type: mediaType,
    media_url: readString(raw.media_url ?? raw.mediaUrl) ?? undefined,
  };
};

const parseMediaChildren = (
  raw: unknown,
): InstagramMediaChild[] | undefined => {
  const value =
    isRecord(raw) && Array.isArray(raw.data)
      ? raw.data
      : Array.isArray(raw)
        ? raw
        : null;

  if (!value) {
    return undefined;
  }

  const children = value.reduce<InstagramMediaChild[]>((acc, item) => {
    const parsed = parseMediaChild(item);

    if (parsed) {
      acc.push(parsed);
    }

    return acc;
  }, []);

  return children.length > 0 ? children : undefined;
};

const parseMediaItem = (raw: unknown): InstagramMediaItem | null => {
  if (!isRecord(raw)) {
    return null;
  }

  const id = readId(raw.id ?? raw.media_id ?? raw.mediaId);
  const mediaType = readString(raw.media_type ?? raw.mediaType) ?? "IMAGE";

  if (id == null) {
    return null;
  }

  return {
    id: String(id),
    caption: readString(raw.caption) ?? undefined,
    media_type: mediaType,
    media_url: readString(raw.media_url ?? raw.mediaUrl) ?? undefined,
    permalink: readString(raw.permalink) ?? undefined,
    timestamp: readString(raw.timestamp) ?? undefined,
    like_count: readNumber(raw.like_count ?? raw.likeCount),
    comments_count: readNumber(raw.comments_count ?? raw.commentsCount),
    thumbnail_url:
      readString(raw.thumbnail_url ?? raw.thumbnailUrl) ?? undefined,
    children: parseMediaChildren(raw.children),
  };
};

const unwrapMediaPayload = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!isRecord(payload)) {
    return [];
  }

  if (Array.isArray(payload.posts)) {
    return payload.posts;
  }

  if (isRecord(payload.posts) && Array.isArray(payload.posts.data)) {
    return payload.posts.data;
  }

  if (Array.isArray(payload.items)) {
    return payload.items;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  return [];
};

const parsePaging = (raw: unknown): InstagramMediaPaging | null => {
  if (!isRecord(raw)) {
    return null;
  }

  const cursors = isRecord(raw.cursors)
    ? {
        before: readString(raw.cursors.before) ?? undefined,
        after: readString(raw.cursors.after) ?? undefined,
      }
    : undefined;

  return {
    cursors,
    next: readString(raw.next) ?? undefined,
    previous: readString(raw.previous) ?? undefined,
    page: readNumber(raw.page),
    page_size: readNumber(raw.page_size ?? raw.pageSize),
    total: readNumber(raw.total),
    total_pages: readNumber(raw.total_pages ?? raw.totalPages),
    has_next:
      typeof raw.has_next === "boolean"
        ? raw.has_next
        : typeof raw.hasNext === "boolean"
          ? raw.hasNext
          : undefined,
    has_previous:
      typeof raw.has_previous === "boolean"
        ? raw.has_previous
        : typeof raw.hasPrevious === "boolean"
          ? raw.hasPrevious
          : undefined,
  };
};

const parseCommentAuthor = (
  raw: unknown,
): InstagramCommentAuthor | undefined => {
  if (!isRecord(raw)) {
    return undefined;
  }

  const id = readId(raw.id);
  const username = readString(raw.username);

  if (id == null && username == null) {
    return undefined;
  }

  return {
    id: id != null ? String(id) : undefined,
    username: username ?? undefined,
  };
};

const parseCommentReplies = (raw: unknown): InstagramComment[] | undefined => {
  const value =
    isRecord(raw) && Array.isArray(raw.data)
      ? raw.data
      : Array.isArray(raw)
        ? raw
        : null;

  if (!value) {
    return undefined;
  }

  const replies = value.reduce<InstagramComment[]>((acc, item) => {
    const parsed = parseInstagramComment(item);

    if (parsed) {
      acc.push(parsed);
    }

    return acc;
  }, []);

  return replies.length > 0 ? replies : undefined;
};

const parseInstagramComment = (raw: unknown): InstagramComment | null => {
  if (!isRecord(raw)) {
    return null;
  }

  const id = readId(raw.id);
  const text = readString(raw.text ?? raw.message);

  if (id == null) {
    return null;
  }

  return {
    id: String(id),
    text: text ?? "",
    timestamp: readString(raw.timestamp ?? raw.created_time) ?? undefined,
    username: readString(raw.username) ?? undefined,
    like_count: readNumber(raw.like_count ?? raw.likeCount),
    hidden:
      typeof raw.hidden === "boolean"
        ? raw.hidden
        : typeof raw.is_hidden === "boolean"
          ? raw.is_hidden
          : undefined,
    from: parseCommentAuthor(raw.from),
    reply_count: readNumber(raw.reply_count ?? raw.replyCount),
    has_replies:
      typeof raw.has_replies === "boolean"
        ? raw.has_replies
        : typeof raw.hasReplies === "boolean"
          ? raw.hasReplies
          : undefined,
    replies: parseCommentReplies(raw.replies),
  };
};

export const parseInstagramCommentsPageResponse = (
  payload: unknown,
): InstagramCommentsPage => ({
  comments: unwrapPayload(payload).reduce<InstagramComment[]>((acc, item) => {
    const parsed = parseInstagramComment(item);

    if (parsed) {
      acc.push(parsed);
    }

    return acc;
  }, []),
  paging: isRecord(payload) ? parsePaging(payload.paging) : null,
});

const extractMediaPaging = (payload: unknown): InstagramMediaPaging | null => {
  if (!isRecord(payload)) {
    return null;
  }

  return parsePaging(payload.paging) ?? parsePaging(payload.posts);
};

export const parseInstagramMediaPageResponse = (
  payload: unknown,
): InstagramMediaPage => ({
  posts: unwrapMediaPayload(payload).reduce<InstagramMediaItem[]>(
    (acc, item) => {
      const parsed = parseMediaItem(item);

      if (parsed) {
        acc.push(parsed);
      }

      return acc;
    },
    [],
  ),
  paging: extractMediaPaging(payload),
});

const readCursorFromUrl = (value: string | undefined, param: string) => {
  if (!value) {
    return undefined;
  }

  try {
    return new URL(value, "http://local").searchParams.get(param) ?? undefined;
  } catch {
    return undefined;
  }
};

export const getInstagramMediaPagingCursor = (
  paging: InstagramMediaPaging | null,
  direction: "next" | "previous",
): string | undefined => {
  if (direction === "next") {
    return paging?.cursors?.after ?? readCursorFromUrl(paging?.next, "after");
  }

  return (
    paging?.cursors?.before ?? readCursorFromUrl(paging?.previous, "before")
  );
};

const addProductReference = (
  refs: InstagramProductReferences,
  mediaId: string,
  productId?: string,
  productVariantId?: string,
) => {
  if (!refs.mediaIds.includes(mediaId)) {
    refs.mediaIds.push(mediaId);
  }

  if (productId) {
    refs.productIdsByMediaId[mediaId] = Array.from(
      new Set([...(refs.productIdsByMediaId[mediaId] ?? []), productId]),
    );
  }

  if (productVariantId) {
    refs.productVariantIdsByMediaId[mediaId] = Array.from(
      new Set([
        ...(refs.productVariantIdsByMediaId[mediaId] ?? []),
        productVariantId,
      ]),
    );
  }
};

const parseProductIdsMap = (raw: unknown, refs: InstagramProductReferences) => {
  if (!isRecord(raw)) {
    return;
  }

  Object.entries(raw).forEach(([mediaId, productIds]) => {
    if (!mediaId) {
      return;
    }

    if (Array.isArray(productIds)) {
      const ids = productIds
        .map((item) => readId(item))
        .filter((item): item is ParsedId => item != null)
        .map(String);

      addProductReference(refs, mediaId);
      refs.productIdsByMediaId[mediaId] = Array.from(new Set(ids));
      return;
    }

    const productId = readId(productIds);
    addProductReference(
      refs,
      mediaId,
      productId ? String(productId) : undefined,
    );
  });
};

const parseProductReferenceItem = (
  raw: unknown,
  refs: InstagramProductReferences,
) => {
  const primitiveId = readId(raw);

  if (primitiveId != null) {
    addProductReference(refs, String(primitiveId));
    return;
  }

  if (!isRecord(raw)) {
    return;
  }

  const nestedMedia = isRecord(raw.media)
    ? readId(raw.media.id)
    : isRecord(raw.instagram_media)
      ? readId(raw.instagram_media.id)
      : null;
  const mediaId = readId(
    raw.media_id ??
      raw.mediaId ??
      raw.instagram_media_id ??
      raw.instagramMediaId ??
      raw.post_id ??
      raw.postId ??
      raw.ig_media_id ??
      raw.id ??
      nestedMedia,
  );
  const productId = readId(
    raw.product_id ?? raw.productId ?? raw.catalog_product_id,
  );
  const productVariantId = readId(
    raw.product_variant_id ?? raw.productVariantId ?? raw.variant_id,
  );

  if (mediaId != null) {
    const postId = String(mediaId);
    const productIdString = productId != null ? String(productId) : undefined;
    const productVariantIdString =
      productVariantId != null ? String(productVariantId) : undefined;

    addProductReference(refs, postId, productIdString, productVariantIdString);

    if (productId != null) {
      refs.pairs.push({
        postId,
        productId,
        productVariantId,
      });
    }
  }
};

export const parseInstagramProductReferencesResponse = (
  payload: unknown,
): InstagramProductReferences => {
  const refs: InstagramProductReferences = {
    businessAccountId: isRecord(payload)
      ? (readString(payload.businessAccountId ?? payload.business_account_id) ??
        undefined)
      : undefined,
    pairs: [],
    mediaIds: [],
    productIdsByMediaId: {},
    productVariantIdsByMediaId: {},
  };

  if (isRecord(payload)) {
    parseProductIdsMap(
      payload.productIdsByMediaId ?? payload.product_ids_by_media_id,
      refs,
    );
  }

  unwrapPayload(payload).forEach((item) => {
    parseProductReferenceItem(item, refs);
  });

  return refs;
};
