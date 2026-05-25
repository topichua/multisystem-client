export type InstagramAnalyzeVariant = {
  color: string;
  size: string;
};

export type InstagramAnalyzeProductResponse = {
  name: string;
  description: string;
  price: number | null;
  images: string[];
  /** Resolved catalog category id from API (`categoryId`), when the model matched one. */
  categoryId: number | null;
  /**
   * Human-readable matched category label from AI (e.g. "Кросівки").
   * Not a numeric id; use `categoryId` for the catalog id.
   */
  matchedCategory: string | null;
  variants: InstagramAnalyzeVariant[];
  brandOrLabel: string;
};

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const isAnalyzeVariant = (v: unknown): v is InstagramAnalyzeVariant => {
  if (!isRecord(v)) return false;
  return typeof v.color === 'string' && typeof v.size === 'string';
};

const unwrapAnalyzePayload = (raw: unknown): Record<string, unknown> | null => {
  const root = isRecord(raw) ? raw : null;
  if (!root) return null;

  const nestedKeys = ['data', 'product', 'result', 'payload'] as const;
  for (const key of nestedKeys) {
    const inner = root[key];
    if (!isRecord(inner)) continue;
    const hasName = typeof inner.name === 'string';
    const hasTitle = typeof inner.title === 'string';
    if (hasName || hasTitle) return inner;
  }

  return root;
};

const parsePrice = (v: unknown): { value: number | null; error?: string } => {
  if (v == null) return { value: null };
  if (typeof v === 'number') {
    return Number.isFinite(v)
      ? { value: v }
      : { value: null, error: 'price must be a finite number' };
  }
  if (typeof v === 'string') {
    const trimmed = v.trim();
    if (trimmed === '') return { value: null };
    const n = Number(trimmed);
    return Number.isFinite(n)
      ? { value: n }
      : { value: null, error: 'price string is not a number' };
  }
  return { value: null, error: 'price must be a number, numeric string, or null' };
};

/** Catalog category id only (`categoryId` / `category_id`). */
const parseCategoryId = (v: unknown): { value: number | null; error?: string } => {
  if (v == null) return { value: null };
  if (typeof v === 'number') {
    return Number.isFinite(v)
      ? { value: v }
      : { value: null, error: 'categoryId must be a finite number' };
  }
  if (typeof v === 'string') {
    const trimmed = v.trim();
    if (trimmed === '') return { value: null };
    const n = Number.parseInt(trimmed, 10);
    return !Number.isNaN(n)
      ? { value: n }
      : { value: null, error: 'categoryId string must be an integer' };
  }
  return { value: null, error: 'categoryId must be a number or numeric string' };
};

/**
 * `matchedCategory` from API: display name (e.g. "Кросівки") or legacy numeric id as string.
 */
const parseMatchedCategoryLabel = (v: unknown): string | null => {
  if (v == null) return null;
  if (typeof v === 'string') {
    const t = v.trim();
    return t === '' ? null : t;
  }
  if (typeof v === 'number' && Number.isFinite(v)) {
    return String(Math.trunc(v));
  }
  return null;
};

const parseImages = (v: unknown): { value: string[]; error?: string } => {
  if (v == null) return { value: [] };
  if (!Array.isArray(v))
    return { value: [], error: 'images must be an array of strings when present' };
  const strings = v.filter((u): u is string => typeof u === 'string');
  if (strings.length !== v.length) {
    return { value: strings, error: 'images must contain only strings' };
  }
  return { value: strings };
};

const parseVariants = (v: unknown): { value: InstagramAnalyzeVariant[]; error?: string } => {
  if (v == null) return { value: [] };
  if (!Array.isArray(v)) return { value: [], error: 'variants must be an array when present' };
  return { value: v.filter(isAnalyzeVariant) };
};

export type ParseInstagramAnalyzeResult =
  | { ok: true; value: InstagramAnalyzeProductResponse }
  | { ok: false; reasons: string[] };

export const parseInstagramAnalyzeProductResponse = (raw: unknown): ParseInstagramAnalyzeResult => {
  const reasons: string[] = [];

  const obj = unwrapAnalyzePayload(raw);
  if (!obj) {
    reasons.push('response must be a JSON object');
    return { ok: false, reasons };
  }

  const name =
    typeof obj.name === 'string'
      ? obj.name
      : typeof obj.title === 'string'
        ? obj.title
        : typeof obj.productName === 'string'
          ? obj.productName
          : typeof obj.product_name === 'string'
            ? obj.product_name
            : null;
  if (!name) {
    reasons.push('missing string field "name" (or "title", "productName", "product_name")');
  }

  const description =
    typeof obj.description === 'string'
      ? obj.description
      : typeof obj.desc === 'string'
        ? obj.desc
        : '';

  const priceResult = parsePrice(obj.price ?? obj.basePrice ?? obj.base_price);
  if (priceResult.error) reasons.push(priceResult.error);

  const imagesRaw = obj.images ?? obj.imageUrls ?? obj.image_urls;
  const imagesResult = parseImages(imagesRaw);
  if (imagesResult.error) reasons.push(imagesResult.error);

  const explicitCategoryId = parseCategoryId(obj.categoryId ?? obj.category_id);

  const matchedCategoryLabel = parseMatchedCategoryLabel(
    obj.matchedCategory ?? obj.matched_category,
  );

  const variantsRaw = obj.variants ?? obj.productVariants ?? obj.product_variants;
  const variantsResult = parseVariants(variantsRaw);
  if (variantsResult.error) reasons.push(variantsResult.error);

  const brandRaw = obj.brandOrLabel ?? obj.brand_or_label ?? obj.label;
  if (brandRaw != null && typeof brandRaw !== 'string') {
    reasons.push('brandOrLabel must be a string when present');
  }

  if (reasons.length > 0 || !name) {
    return {
      ok: false,
      reasons:
        reasons.length > 0
          ? reasons
          : ['missing string field "name" (or "title", "productName", "product_name")'],
    };
  }

  return {
    ok: true,
    value: {
      name,
      description,
      categoryId: explicitCategoryId.value ?? null,
      price: priceResult.value,
      images: imagesResult.value,
      matchedCategory: matchedCategoryLabel,
      variants: variantsResult.value,
      brandOrLabel: typeof brandRaw === 'string' ? brandRaw : '',
    },
  };
};
