import { ConversationParticipantAvatar } from "@/features/conversations/components/conversation-participant-avatar";
import type {
  Conversation,
  ConversationParticipant,
} from "@/features/conversations/model/types";

type ConversationRowAvatarProps = {
  participant: ConversationParticipant;
  source: Conversation["source"];
  followUp?: Conversation["followUp"];
};

export const ConversationRowAvatar = ({
  participant,
  source,
  followUp = null,
}: ConversationRowAvatarProps) => (
  <ConversationParticipantAvatar
    participant={participant}
    source={source}
    followUp={followUp}
  />
);
