/** Instagram Graph API–shaped media rows from `/api/instagram/media`. */

export type InstagramMediaType = 'CAROUSEL_ALBUM' | 'IMAGE' | 'VIDEO' | string;

export type InstagramMediaChild = {
  id: string;
  media_type: InstagramMediaType;
  media_url: string;
};

export type InstagramAccountProfile = {
  username?: string;
  name?: string;
  biography?: string;
  profilePictureUrl?: string;
};

export type InstagramMediaResponse = {
  posts: InstagramMediaItem[];
  profile: InstagramAccountProfile | null;
};

export type InstagramMediaItem = {
  id: string;
  caption?: string;
  media_type: InstagramMediaType;
  /** Present for IMAGE, VIDEO, and often the cover frame for CAROUSEL_ALBUM */
  media_url?: string;
  permalink: string;
  timestamp: string;
  like_count: number;
  comments_count: number;
  /** VIDEO posts may include a poster image */
  thumbnail_url?: string;
  /** CAROUSEL_ALBUM only */
  children?: InstagramMediaChild[];
};

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const isMediaChild = (v: unknown): v is InstagramMediaChild => {
  if (!isRecord(v)) return false;
  return (
    typeof v.id === 'string' && typeof v.media_type === 'string' && typeof v.media_url === 'string'
  );
};

const isMediaItem = (v: unknown): v is InstagramMediaItem => {
  if (!isRecord(v)) return false;
  if (
    typeof v.id !== 'string' ||
    typeof v.permalink !== 'string' ||
    typeof v.timestamp !== 'string'
  ) {
    return false;
  }
  if (typeof v.media_type !== 'string') return false;
  if (typeof v.like_count !== 'number' || typeof v.comments_count !== 'number') return false;
  if (v.children !== undefined) {
    if (!Array.isArray(v.children) || !v.children.every(isMediaChild)) return false;
  }
  return true;
};

const unwrapPayload = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) return payload;
  if (isRecord(payload) && 'data' in payload && Array.isArray(payload.data)) {
    return payload.data;
  }
  return [];
};

const parseInstagramAccountProfile = (raw: unknown): InstagramAccountProfile | null => {
  if (!isRecord(raw)) {
    return null;
  }

  const profilePictureUrl =
    typeof raw.profile_picture_url === 'string'
      ? raw.profile_picture_url
      : typeof raw.profilePictureUrl === 'string'
        ? raw.profilePictureUrl
        : undefined;

  const name =
    typeof raw.name === 'string'
      ? raw.name
      : typeof raw.username === 'string'
        ? raw.username
        : undefined;

  const biography =
    typeof raw.biography === 'string'
      ? raw.biography
      : typeof raw.description === 'string'
        ? raw.description
        : undefined;

  const username = typeof raw.username === 'string' ? raw.username : undefined;

  if (!name && !biography && !profilePictureUrl && !username) {
    return null;
  }

  return { username, name, biography, profilePictureUrl };
};

const extractProfileFromPayload = (payload: unknown): InstagramAccountProfile | null => {
  if (!isRecord(payload)) {
    return null;
  }

  return (
    parseInstagramAccountProfile(payload.profile) ??
    parseInstagramAccountProfile(payload.account) ??
    parseInstagramAccountProfile(payload.user)
  );
};

export const parseInstagramMediaPayload = (payload: unknown): InstagramMediaItem[] =>
  unwrapPayload(payload).filter(isMediaItem);

export const parseInstagramMediaResponse = (payload: unknown): InstagramMediaResponse => ({
  posts: parseInstagramMediaPayload(payload),
  profile: extractProfileFromPayload(payload),
});
