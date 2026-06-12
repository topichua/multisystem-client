export type InstagramIntegrationId = string | number;

export type InstagramMediaFilter = "all" | "without-product" | "linked";

export type InstagramIntegration = {
  integration_id: InstagramIntegrationId;
  business_account_id: string;
  name: string;
  media_count?: number;
  followers_count?: number;
};

export type InstagramMediaType = "CAROUSEL_ALBUM" | "IMAGE" | "VIDEO" | string;

export type InstagramMediaChild = {
  id: string;
  media_type: InstagramMediaType;
  media_url?: string;
};

export type InstagramMediaItem = {
  id: string;
  caption?: string;
  media_type: InstagramMediaType;
  media_url?: string;
  permalink?: string;
  timestamp?: string;
  like_count?: number;
  comments_count?: number;
  thumbnail_url?: string;
  children?: InstagramMediaChild[];
};

export type InstagramMediaPaging = {
  cursors?: {
    before?: string;
    after?: string;
  };
  next?: string;
  previous?: string;
  page?: number;
  page_size?: number;
  total?: number;
  total_pages?: number;
  has_next?: boolean;
  has_previous?: boolean;
};

export type InstagramMediaPage = {
  posts: InstagramMediaItem[];
  paging: InstagramMediaPaging | null;
};

export type InstagramProductReferencePair = {
  postId: string;
  productId: InstagramIntegrationId;
  productVariantId: InstagramIntegrationId | null;
};

export type InstagramProductReferences = {
  businessAccountId?: string;
  pairs: InstagramProductReferencePair[];
  mediaIds: string[];
  productIdsByMediaId: Record<string, string[]>;
  productVariantIdsByMediaId: Record<string, string[]>;
};

export type InstagramPostProductVariant = {
  id: InstagramIntegrationId;
  customFields: unknown[];
  price: number;
  inStock: boolean;
  quantity: number;
  imageUrl: string | null;
  sku: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  media: unknown[];
  referenceId?: InstagramIntegrationId;
};

export type InstagramPostProduct = {
  id: InstagramIntegrationId;
  name: string;
  productType: string;
  status: string;
  price: number;
  currency: string;
  inStock: boolean;
  quantity: number;
  mainImageUrl: string | null;
  categoryId: InstagramIntegrationId | null;
  createdAt: string;
  updatedAt: string;
  variants: InstagramPostProductVariant[];
  referenceId?: InstagramIntegrationId;
};

export type InstagramPostProductVariantsResponse = {
  postId: string;
  businessAccountId?: string;
  items: InstagramPostProduct[];
};

export type InstagramPostDetails = {
  post: InstagramMediaItem;
  productVariants: InstagramPostProductVariantsResponse | null;
};

export type CreateProductInstagramReferencePayload = {
  businessAccountId: string;
  postId: string;
  productVariantId: number;
  permalink: string;
};
