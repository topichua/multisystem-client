import { ConversationParticipantAvatar } from "@/features/conversations/components/conversation-participant-avatar";
import type {
  Conversation,
  ConversationParticipant,
} from "@/features/conversations/model/types";

type ConversationRowAvatarProps = {
  participant: ConversationParticipant;
  source: Conversation["source"];
};

export const ConversationRowAvatar = ({
  participant,
  source,
}: ConversationRowAvatarProps) => (
  <ConversationParticipantAvatar participant={participant} source={source} />
);
