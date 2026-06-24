import type { InstagramComment } from "@/features/instagram/model/instagram.types";

import { formatHandle } from "./instagram-page-format";

export type OwnInstagramIdentity = {
  id?: string;
  username?: string;
};

export const getCommentUsername = (comment: InstagramComment): string =>
  comment.username || comment.from?.username || "";

export const getCommentAuthor = (comment: InstagramComment): string =>
  comment.from?.name || getCommentUsername(comment) || "Instagram";

export const normalizeHandle = (value: string | undefined): string =>
  (value ?? "").trim().replace(/^@/, "").toLowerCase();

export const getCommentHandle = (comment: InstagramComment): string =>
  formatHandle(getCommentUsername(comment) || getCommentAuthor(comment));

export const getCommentAuthorLabel = (comment: InstagramComment): string => {
  const author = getCommentAuthor(comment);
  const handle = getCommentHandle(comment);
  const normalizedAuthor = normalizeHandle(author);
  const normalizedHandle = normalizeHandle(handle);

  if (!handle || normalizedAuthor === normalizedHandle) {
    return author;
  }

  return `${author} (${handle})`;
};

export const getCommentAvatarUrl = (
  comment: InstagramComment,
): string | undefined => comment.from?.profilePic;

export const getAvatarLabel = (value: string): string =>
  normalizeHandle(value).charAt(0).toUpperCase() || "?";

export const isOwnReply = (
  reply: InstagramComment,
  ownIdentity: OwnInstagramIdentity,
): boolean => {
  const ownId = ownIdentity.id;
  const ownUsername = normalizeHandle(ownIdentity.username);
  const replyAuthorId = reply.from?.id;
  const replyUsername = normalizeHandle(reply.username ?? reply.from?.username);

  return Boolean(
    (ownId && replyAuthorId && String(replyAuthorId) === String(ownId)) ||
    (ownUsername && replyUsername && replyUsername === ownUsername),
  );
};

export const getReplyAuthorLabel = (
  reply: InstagramComment,
  ownIdentity: OwnInstagramIdentity,
  ownLabel: string,
): string =>
  isOwnReply(reply, ownIdentity) ? ownLabel : getCommentAuthorLabel(reply);

export const hasSentReply = (
  replies: InstagramComment[],
  ownIdentity: OwnInstagramIdentity,
): boolean => replies.some((reply) => isOwnReply(reply, ownIdentity));
