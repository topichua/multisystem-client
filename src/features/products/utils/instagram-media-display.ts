import type { InstagramMediaItem } from "@/features/products/model/instagram-media.types";

export type InstagramMediaSlide = {
  id: string;
  url: string;
};

export function isVideoFileUrl(url: string): boolean {
  return /\.(mp4|webm|mov)(\?|$)/i.test(url) || url.includes("/v/t2/");
}

export function getPostCoverUrl(post: InstagramMediaItem): string | undefined {
  if (post.media_type === "VIDEO" && post.thumbnail_url) {
    return post.thumbnail_url;
  }
  if (post.media_url) {
    return post.media_url;
  }
  return post.children?.[0]?.media_url;
}

export function getPostMediaSlides(
  post: InstagramMediaItem,
): InstagramMediaSlide[] {
  if (
    post.media_type === "CAROUSEL_ALBUM" &&
    post.children &&
    post.children.length > 0
  ) {
    return post.children.map((child) => ({
      id: child.id,
      url: child.media_url,
    }));
  }

  const cover = getPostCoverUrl(post);
  if (!cover) {
    return [];
  }

  return [{ id: post.id, url: cover }];
}
