import type { ConversationMessage } from "@/features/conversations/model/types";

export type MessageBodyProps = {
  message: ConversationMessage;
  index: number;
  clientTempId?: string;
  isOwn: boolean;
  timeLabel: string;
  hasReplyQuote: boolean;
};
