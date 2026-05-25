import type { Conversation } from '@/features/conversations/model/types';

/** Raw message shape from GET /conversations/:id/messages and WebSocket pushes. */
export type InstagramMessageDto = {
  id: string;
  created_time: string;
  from?: { id: string; name?: string; username?: string; email?: string };
  to?: { data?: Array<{ id: string; name?: string; username?: string }> };
  message?: string;
  attachments?: { data?: Array<Record<string, unknown>> };
  shares?: { data?: Array<Record<string, unknown>> };
  story?: Record<string, unknown>;
  reactions?: { data?: Array<Record<string, unknown>> };
  tags?: { data?: Array<{ name?: string }> };
  is_unsupported?: boolean;
  edited_at?: string;
  read_at?: string;
  system_updated_at: string;
  reply_to_id?: string;
  replied_to_message?: {
    id: string;
    created_time?: string;
    message?: string;
    attachments?: unknown;
    from?: { id: string; name?: string; username?: string };
  };
};

export type ConversationsUpdatePayload = {
  conversationId: number;
  conversation?: Conversation;
  message?: InstagramMessageDto;
};

export type ConversationsUpdateHandler = (payload: ConversationsUpdatePayload) => void;

export type ConversationsRealtimeAuthErrorHandler = () => void;

export type ConversationsRealtimeConnectOptions = {
  onAuthError?: ConversationsRealtimeAuthErrorHandler;
};
