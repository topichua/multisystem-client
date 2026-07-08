import type { MessageAttachmentEntry } from "@/features/conversations/model/types";

export type MessagePlayableAttachmentType = "audio" | "video";

export type MessagePlayableAttachment = {
  type: MessagePlayableAttachmentType;
  src: string;
  poster?: string;
  title?: string;
};

const ATTACHMENT_PLACEHOLDERS: Record<
  MessagePlayableAttachmentType | "image",
  string
> = {
  audio: "[audio]",
  image: "[image]",
  video: "[video]",
};

const isPlayableAttachmentType = (
  type: MessageAttachmentEntry["type"],
): type is MessagePlayableAttachmentType =>
  type === "audio" || type === "video";

export const getAttachmentImageUrl = (
  attachment: MessageAttachmentEntry,
): string | null => {
  const fromImageData =
    attachment.image_data?.url ?? attachment.image_data?.preview_url;

  if (fromImageData) {
    return fromImageData;
  }

  if (attachment.type === "image" && attachment.url) {
    return attachment.url;
  }

  return null;
};

export const getAttachmentPlayableMedia = (
  attachment: MessageAttachmentEntry,
): MessagePlayableAttachment | null => {
  if (!isPlayableAttachmentType(attachment.type)) {
    return null;
  }

  const src =
    attachment.type === "video"
      ? (attachment.video_data?.url ?? attachment.url)
      : attachment.url;

  if (!src) {
    return null;
  }

  return {
    type: attachment.type,
    src,
    poster:
      attachment.type === "video"
        ? attachment.video_data?.preview_url
        : undefined,
    title: attachment.name,
  };
};

export const getAttachmentUrl = (
  attachment: MessageAttachmentEntry,
): string | null =>
  getAttachmentPlayableMedia(attachment)?.src ??
  getAttachmentImageUrl(attachment) ??
  attachment.video_data?.url ??
  attachment.video_data?.preview_url ??
  null;

export const isAttachmentPlaceholderMessage = (
  message: string,
  attachments: MessageAttachmentEntry[],
): boolean => {
  const normalizedMessage = message.trim().toLowerCase();

  if (!normalizedMessage) {
    return false;
  }

  return attachments.some((attachment) => {
    const type = attachment.type;

    if (type !== "audio" && type !== "image" && type !== "video") {
      return false;
    }

    return normalizedMessage === ATTACHMENT_PLACEHOLDERS[type];
  });
};
