export type ConversationChannel = "instagram" | "telegram";
export type ConversationSource = 1 | 2;

export type ConversationStatus = {
  id: number;
  name: string;
  color: string;
};

export type ConversationAssignee = {
  id: number;
  name: string;
  profilePic?: string | null;
  initials?: string;
  avatarColor?: string;
};

export type ConversationParticipant = {
  id: string | number;
  name: string;
  username?: string;
  profilePic?: string | null;
  phone?: string | null;
  initials?: string;
  avatarColor?: string;
};

export type ConversationFollowUp = {
  id: number;
  scheduledAt: string;
};

export type ConversationFollowUpWritePayload = {
  scheduledAt: string;
  message: string;
  templateId?: number;
  cancelOnReply?: boolean;
};

export type ConversationFollowUpDetails = ConversationFollowUp & {
  message: string;
  templateId: number | null;
  cancelOnReply: boolean;
  status?: string;
};

export type ConversationListItemResponse = {
  id: number;
  instUpdatedAt: string;
  isUnread: boolean;
  source: ConversationSource;
  groupId: number | null;
  responsibleMemberId: number | null;
  responsibleMemberSetAt: string | null;
  lastMessage: string | null;
  isLastMessageFromMe: boolean;
  participant: {
    id: string | number;
    name: string;
    username: string;
    profilePic: string | null;
    phone: string | null;
  };
  canTakeChat: boolean;
  canAssignResponsible: boolean;
  followUp: ConversationFollowUp | null;
};

export type Conversation = {
  id: number;
  participant: ConversationParticipant;
  channel: ConversationChannel;
  source: ConversationSource;
  groupId: number | null;
  responsibleMemberId: number | null;
  lastMessage?: string | null;
  isLastMessageFromMe: boolean;
  unreadCount: number;
  status: ConversationStatus | null;
  assignee: ConversationAssignee | null;
  instUpdatedAt: string;
  canTakeChat: boolean;
  canAssignResponsible: boolean;
  followUp: ConversationFollowUp | null;
};

export type ConversationUpdatePayload = {
  groupId?: number | null;
  responsible_member_id?: number | null;
};

export type ConversationEventType =
  | "conversation_created"
  | "group_changed"
  | "responsible_changed"
  | "order_created"
  | (string & {});

export type ConversationEvent = {
  id: number;
  conversationId: number;
  type: ConversationEventType;
  actorId: number | null;
  payload: Record<string, unknown>;
  createdAt: string;
};

export type ConversationEventsListResponse = {
  items: ConversationEvent[];
};

export type ConversationsListCountersResponse = {
  total: number;
  unread: number;
  withoutResponsible: number;
};

export type ConversationsListResponse = {
  items: ConversationListItemResponse[];
  counters: ConversationsListCountersResponse;
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

export type MessageAttachmentType = "image" | "audio" | "video" | string;

export type MessageAttachmentEntry = {
  id?: string;
  image_data?: MessageImageData;
  video_data?: MessageVideoData;
  type?: MessageAttachmentType;
  url?: string;
  name?: string;
  key?: string;
  r2_key?: string;
  at?: string;
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

export type ConversationProductSuggestionCustomField = {
  fieldId: number;
  key: string;
  label: string;
  type: "options" | "text" | string;
  value: string;
  order: number;
};

export type ConversationProductSuggestionMedia = {
  id: number;
  productId: number;
  variantId: number;
  uploadMediaId: number;
  url: string;
  type: string;
  sourceUrl: string;
  sortOrder: number;
};

export type ConversationProductSuggestionVariant = {
  id: number;
  customFields: ConversationProductSuggestionCustomField[];
  price: number;
  inStock: boolean;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  imageUrl: string | null;
  sku: string | null;
  status: "draft" | "active" | "archived" | string;
  wishlistCount: number;
  createdAt: string;
  updatedAt: string;
  media: ConversationProductSuggestionMedia[];
  referenceId: number;
};

export type ConversationProductSuggestionProduct = {
  id: number;
  name: string;
  productType: "single" | "variants" | string;
  status: "draft" | "active" | "archived" | string;
  price: number;
  currency: string;
  inStock: boolean;
  quantity: number;
  wishlistCount: number;
  mainImageUrl: string;
  categoryId: number;
  weightGrams: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  createdAt: string;
  updatedAt: string;
  variants: ConversationProductSuggestionVariant[];
};

export type ConversationProductSuggestionsResponse = {
  conversationId: number;
  postId: string;
  businessAccountId: string;
  items: ConversationProductSuggestionProduct[];
};
