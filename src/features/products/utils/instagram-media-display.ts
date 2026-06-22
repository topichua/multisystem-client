type InstagramMediaDisplayChild = {
  id: string;
  media_type?: string;
  media_url?: string;
};

type InstagramMediaDisplayPost = {
  id: string;
  media_type: string;
  media_url?: string;
  thumbnail_url?: string;
  children?: InstagramMediaDisplayChild[];
};

export type InstagramMediaSlide = {
  id: string;
  type: "image" | "video";
  url: string;
  posterUrl?: string;
};

export type InstagramMediaDisplaySource = {
  type: "image" | "video";
  url: string;
  posterUrl?: string;
};

export function isVideoFileUrl(url: string): boolean {
  return /\.(mp4|webm|mov)(\?|$)/i.test(url) || url.includes("/v/t2/");
}

export function isInstagramVideoMediaType(
  mediaType: string | undefined,
): boolean {
  return mediaType === "VIDEO";
}

function hasMediaUrl(
  child: InstagramMediaDisplayChild,
): child is InstagramMediaDisplayChild & { media_url: string } {
  return Boolean(child.media_url);
}

export function isInstagramVideoPost(post: InstagramMediaDisplayPost): boolean {
  return isInstagramVideoMediaType(post.media_type);
}

export function getPostVideoUrl(
  post: InstagramMediaDisplayPost,
): string | undefined {
  return isInstagramVideoPost(post) ? post.media_url : undefined;
}

export function getPostCoverUrl(
  post: InstagramMediaDisplayPost,
): string | undefined {
  if (isInstagramVideoPost(post) && post.thumbnail_url) {
    return post.thumbnail_url;
  }
  if (post.media_url) {
    return post.media_url;
  }
  return post.children?.[0]?.media_url;
}

export function getPostMediaDisplaySource(
  post: InstagramMediaDisplayPost,
): InstagramMediaDisplaySource | undefined {
  const videoUrl = getPostVideoUrl(post);
  if (videoUrl) {
    return {
      type: "video",
      url: videoUrl,
      posterUrl: post.thumbnail_url,
    };
  }

  const coverUrl = getPostCoverUrl(post);
  return coverUrl ? { type: "image", url: coverUrl } : undefined;
}

export function getPostMediaSlides(
  post: InstagramMediaDisplayPost,
): InstagramMediaSlide[] {
  if (
    post.media_type === "CAROUSEL_ALBUM" &&
    post.children &&
    post.children.length > 0
  ) {
    return post.children.filter(hasMediaUrl).map((child) => ({
      id: child.id,
      type: isInstagramVideoMediaType(child.media_type) ? "video" : "image",
      url: child.media_url,
    }));
  }

  const mediaSource = getPostMediaDisplaySource(post);
  if (!mediaSource) {
    return [];
  }

  return [{ id: post.id, ...mediaSource }];
}
