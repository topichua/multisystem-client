import type { ComponentType } from "react";

import type { ConversationMessageType } from "@/features/conversations/model/types";

import type { MessageBodyProps } from "./message-body.types";
import { MessageInstagramPostBody } from "./message-instagram-post-body";
import { MessageTextBody } from "./message-text-body";

const MESSAGE_BODY_BY_TYPE: Record<
  ConversationMessageType,
  ComponentType<MessageBodyProps>
> = {
  text: MessageTextBody,
  instagram_post: MessageInstagramPostBody,
};

export const MessageBody = (
  props: MessageBodyProps & { type: ConversationMessageType },
) => {
  const { type, ...bodyProps } = props;
  const Body = MESSAGE_BODY_BY_TYPE[type] ?? MessageTextBody;

  return <Body {...bodyProps} />;
};
