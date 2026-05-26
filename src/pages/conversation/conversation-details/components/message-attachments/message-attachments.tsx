import { Image } from "antd";
import { memo } from "react";

import type {
  MessageAttachmentEntry,
  MessageAttachments as MessageAttachmentsPayload,
} from "@/features/conversations/model/types";

import * as S from "./message-attachments.styled";

type MessageAttachmentsProps = {
  messageId: string;
  attachments: MessageAttachmentsPayload;
};

const getAttachmentImageUrl = (attachment: MessageAttachmentEntry) => {
  return (
    attachment.image_data?.url ?? attachment.image_data?.preview_url ?? null
  );
};

export const MessageAttachments = memo(
  ({ messageId, attachments }: MessageAttachmentsProps) => {
    const imageAttachments = attachments.data
      .map((attachment, index) => ({
        id: attachment.id ?? `${messageId}-attachment-${index}`,
        imageUrl: getAttachmentImageUrl(attachment),
      }))
      .filter((attachment): attachment is { id: string; imageUrl: string } =>
        Boolean(attachment.imageUrl),
      );

    if (imageAttachments.length === 0) {
      return null;
    }

    return (
      <S.Attachments>
        {imageAttachments.map((attachment) => (
          <Image
            width={200}
            key={attachment.id}
            alt="Message attachment"
            src={attachment.imageUrl}
          />
        ))}
      </S.Attachments>
    );
  },
);

MessageAttachments.displayName = "MessageAttachments";
