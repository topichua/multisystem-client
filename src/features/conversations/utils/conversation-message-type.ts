import type {
  ConversationMessage,
  ConversationMessageType,
} from "../model/types";

export const CONVERSATION_MESSAGE_TYPES = [
  "text",
  "instagram_post",
] as const satisfies readonly ConversationMessageType[];

export const isConversationMessageType = (
  value: unknown,
): value is ConversationMessageType =>
  value === "text" || value === "instagram_post";

const getShareField = (
  message: ConversationMessage,
  key: "type" | "url" | "link" | "name",
): string | undefined => {
  const share = message.shares?.data?.[0];

  if (share == null) {
    return undefined;
  }

  const value = share[key];

  return typeof value === "string" && value.trim() !== "" ? value : undefined;
};

export const getConversationMessageType = (
  message: ConversationMessage,
): ConversationMessageType => {
  if (
    message.type === "instagram_post" ||
    getShareField(message, "type") === "ig_post"
  ) {
    return "instagram_post";
  }

  return isConversationMessageType(message.type) ? message.type : "text";
};

export type InstagramPostPreview = {
  imageUrl: string | null;
  caption: string;
};

export const getInstagramPostPreview = (
  message: ConversationMessage,
): InstagramPostPreview => {
  const attachment = message.attachments?.data?.[0];
  const imageUrl =
    (typeof attachment?.url === "string" && attachment.url.trim() !== ""
      ? attachment.url
      : null) ??
    getShareField(message, "url") ??
    getShareField(message, "link") ??
    null;

  const caption =
    (typeof attachment?.name === "string" ? attachment.name.trim() : "") ||
    (getShareField(message, "name") ?? "");

  return { imageUrl, caption };
};
