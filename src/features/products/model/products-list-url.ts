import {
  parseProductsListSort,
  type ProductsListSort,
} from '@/features/products/model/product.types';
import {
  readStoredProductsListViewMode,
  type ProductsListViewMode,
} from '@/features/products/model/products-list-view-storage';

export type { ProductsListViewMode };

export type ProductsListAppliedUrlState = {
  keyword: string;
  sort: ProductsListSort;
  categoryIds: number[];
  status: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  page: number;
  pageSize: number;
  view: ProductsListViewMode;
};

export function parseProductsListViewMode(raw: string | null): ProductsListViewMode {
  return raw === 'grid' ? 'grid' : 'list';
}

const DEFAULT_PAGE_SIZE = 10;

export const PRODUCTS_LIST_KEYWORD_MIN_LENGTH = 3;

export function normalizeAppliedListKeyword(keyword: string): string {
  const t = keyword.trim();
  return t.length >= PRODUCTS_LIST_KEYWORD_MIN_LENGTH ? t : '';
}

function parseOptionalNumber(raw: string | null): number | null {
  if (raw == null || raw === '') {
    return null;
  }
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function parseOptionalPositiveInt(raw: string | null): number | null {
  if (raw == null || raw === '') {
    return null;
  }
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) {
    return null;
  }
  return n;
}

export function parseProductsListUrlSearchParams(
  searchParams: URLSearchParams,
): ProductsListAppliedUrlState {
  const keyword = normalizeAppliedListKeyword(searchParams.get('keyword') ?? '');
  const sort = parseProductsListSort(searchParams.get('sort'));
  const categoryRaw = searchParams.get('categoryIds');
  const categoryIds = categoryRaw
    ? categoryRaw
        .split(',')
        .map((s) => Number(s.trim()))
        .filter((n) => Number.isFinite(n) && n >= 1)
    : [];
  const statusRaw = searchParams.get('status');
  const status =
    statusRaw === 'draft' || statusRaw === 'active' || statusRaw === 'archived' ? statusRaw : null;

  return {
    keyword,
    sort,
    categoryIds: [...new Set(categoryIds)],
    status,
    minPrice: parseOptionalNumber(searchParams.get('minPrice')),
    maxPrice: parseOptionalNumber(searchParams.get('maxPrice')),
    page: Math.max(1, parseOptionalPositiveInt(searchParams.get('page')) ?? 1),
    pageSize: Math.min(
      100,
      Math.max(1, parseOptionalPositiveInt(searchParams.get('pageSize')) ?? DEFAULT_PAGE_SIZE),
    ),
    view: searchParams.has('view')
      ? parseProductsListViewMode(searchParams.get('view'))
      : readStoredProductsListViewMode(),
  };
}

export function serializeProductsListUrlSearchParams(
  state: ProductsListAppliedUrlState,
): URLSearchParams {
  const sp = new URLSearchParams();
  const kw = normalizeAppliedListKeyword(state.keyword);
  if (kw) {
    sp.set('keyword', kw);
  }
  if (state.sort !== 'created_desc') {
    sp.set('sort', state.sort);
  }
  if (state.categoryIds.length) {
    sp.set('categoryIds', [...new Set(state.categoryIds)].sort((a, b) => a - b).join(','));
  }
  if (state.status) {
    sp.set('status', state.status);
  }
  if (state.minPrice != null) {
    sp.set('minPrice', String(state.minPrice));
  }
  if (state.maxPrice != null) {
    sp.set('maxPrice', String(state.maxPrice));
  }
  if (state.page !== 1) {
    sp.set('page', String(state.page));
  }
  if (state.pageSize !== DEFAULT_PAGE_SIZE) {
    sp.set('pageSize', String(state.pageSize));
  }
  if (state.view === 'grid') {
    sp.set('view', 'grid');
  }
  return sp;
}

export function productsListUrlSearchStringCanonical(sp: URLSearchParams): string {
  const pairs: [string, string][] = [];
  sp.forEach((value, key) => {
    pairs.push([key, value]);
  });
  return pairs
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
}

export type ProductsListReturnState = {
  productsListSearch?: string;
};

export function readProductsListReturnSearch(state: unknown): string {
  if (!state || typeof state !== 'object') {
    return '';
  }

  const search = (state as ProductsListReturnState).productsListSearch;
  return typeof search === 'string' ? search.replace(/^\?/, '') : '';
}

export function productsListAppliedUrlStateEquals(
  a: ProductsListAppliedUrlState,
  b: ProductsListAppliedUrlState,
): boolean {
  const as = [...a.categoryIds].sort((x, y) => x - y);
  const bs = [...b.categoryIds].sort((x, y) => x - y);
  return (
    a.keyword === b.keyword &&
    a.sort === b.sort &&
    a.status === b.status &&
    a.minPrice === b.minPrice &&
    a.maxPrice === b.maxPrice &&
    a.page === b.page &&
    a.pageSize === b.pageSize &&
    a.view === b.view &&
    as.length === bs.length &&
    as.every((id, i) => id === bs[i])
  );
}
