import type { ConversationMessage } from "@/features/conversations/model/types";

import type { InstagramMessageDto } from "./conversations-realtime.types";

export const normalizeInstagramMessage = (
  dto: InstagramMessageDto,
): ConversationMessage => ({
  id: dto.id,
  created_time: dto.created_time,
  from: dto.from,
  to: { data: dto.to?.data ?? [] },
  message: dto.message ?? "",
  ...(dto.attachments != null
    ? { attachments: dto.attachments as ConversationMessage["attachments"] }
    : {}),
  ...(dto.shares?.data != null
    ? { shares: { data: dto.shares.data as Array<Record<string, unknown>> } }
    : {}),
  ...(dto.story != null ? { story: dto.story } : {}),
  ...(dto.reactions?.data != null
    ? {
        reactions: {
          data: dto.reactions.data as Array<Record<string, unknown>>,
        },
      }
    : {}),
  ...(dto.tags?.data != null ? { tags: { data: dto.tags.data } } : {}),
  ...(dto.is_unsupported != null ? { is_unsupported: dto.is_unsupported } : {}),
  ...(dto.edited_at != null ? { edited_at: dto.edited_at } : {}),
  ...(dto.read_at != null ? { read_at: dto.read_at } : {}),
  system_updated_at: dto.system_updated_at,
  ...(dto.reply_to_id != null ? { reply_to_id: dto.reply_to_id } : {}),
  ...(dto.replied_to_message != null
    ? {
        replied_to_message: {
          id: dto.replied_to_message.id,
          created_time: dto.replied_to_message.created_time ?? "",
          message: dto.replied_to_message.message ?? "",
          ...(dto.replied_to_message.from != null
            ? { from: dto.replied_to_message.from }
            : {}),
        },
      }
    : {}),
});
