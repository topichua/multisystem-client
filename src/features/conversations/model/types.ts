export type ConversationParticipant = {
  id: string;
  name: string;
  username: string;
  profilePic: string;
};

export type Conversation = {
  id: number;
  instUpdatedAt: string;
  isUnread: boolean;
  source: number;
  groupId: number | null;
  lastMessage: string;
  isLastMessageFromMe: boolean;
  participant: ConversationParticipant;
};

export type ConversationUpdatePayload = {
  groupId: number | null;
};

export type ConversationsListResponse = {
  items: Conversation[];
};

export type MessageParticipant = {
  id: string;
  name?: string;
  email?: string;
  username?: string;
};

export type MessageRecipient = {
  id: string;
  username?: string;
};

export type MessageToField = {
  data: MessageRecipient[];
};

export type MessageOutboundStatus = "pending" | "failed";

export type MessagesPaging = {
  cursors?: { before?: string; after?: string };
  next?: string;
  previous?: string;
  page?: number;
  page_size?: number;
  total?: number;
  total_pages?: number;
  has_next?: boolean;
  has_previous?: boolean;
};

export type MessageImageData = {
  width: number;
  height: number;
  max_width: number;
  max_height: number;
  preview_url: string;
  url: string;
  animated_gif_url?: string;
  animated_gif_preview_url?: string;
  render_as_sticker?: boolean;
};

export type MessageVideoData = {
  url?: string;
  preview_url?: string;
};

export type MessageAttachmentEntry = {
  id?: string;
  image_data?: MessageImageData;
  video_data?: MessageVideoData;
};

export type MessageAttachments = {
  data: MessageAttachmentEntry[];
  paging?: MessagesPaging;
};

export type MessageWebhookReaction = {
  action: string;
  reaction: string;
  emoji: string;
};

export type MessageWebhookMessaging = {
  timestamp: number;
  message_edit?: {
    num_edit: number;
  };
  reaction?: MessageWebhookReaction;
};

export type RepliedToMessage = {
  id: string;
  created_time: string;
  message: string;
  from?: MessageParticipant;
};

export type ConversationMessage = {
  id: string;
  created_time: string;
  conversation?: Record<string, unknown>;
  from?: MessageParticipant;
  to: MessageToField;
  message: string;
  is_unsupported?: boolean;
  clientTempId?: string;
  outboundStatus?: MessageOutboundStatus;
  sendError?: string;
  attachments?: MessageAttachments;
  shares?: { data: Array<Record<string, unknown>> };
  story?: Record<string, unknown>;
  reactions?: { data: Array<Record<string, unknown>> };
  tags?: { data: Array<{ name?: string }> };
  edited_at?: string;
  read_at?: string;
  system_updated_at?: string;
  reply_to_id?: string;
  replied_to_message?: RepliedToMessage;
  webhook_messaging?: MessageWebhookMessaging;
};

export type MessagesListResponseBody = {
  data: ConversationMessage[];
  paging: MessagesPaging;
};

export type SendMessagePayload = {
  message: string;
  reply_to_id?: string;
};

export type SendMessageApiResponse = {
  message_id: string;
  recipient_id?: string;
};

export type SyncConversationsPayload = Record<string, unknown> | undefined;
