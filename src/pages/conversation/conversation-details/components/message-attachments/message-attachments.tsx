import { Image } from "antd";
import { memo } from "react";

import type { MessageAttachments as MessageAttachmentsPayload } from "@/features/conversations/model/types";

import {
  getAttachmentImageUrl,
  getAttachmentPlayableMedia,
} from "./message-attachment-utils";
import { MessageMediaAttachment } from "./message-media-attachment";
import * as S from "./message-attachments.styled";

type MessageAttachmentsProps = {
  messageId: string;
  attachments: MessageAttachmentsPayload;
};

type RenderableAttachment =
  | {
      id: string;
      type: "image";
      imageUrl: string;
    }
  | {
      id: string;
      type: "media";
      media: NonNullable<ReturnType<typeof getAttachmentPlayableMedia>>;
    };

export const MessageAttachments = memo(
  ({ messageId, attachments }: MessageAttachmentsProps) => {
    const renderableAttachments = attachments.data
      .map((attachment, index): RenderableAttachment | null => {
        const id = attachment.id ?? `${messageId}-attachment-${index}`;
        const media = getAttachmentPlayableMedia(attachment);

        if (media != null) {
          return {
            id,
            type: "media",
            media,
          };
        }

        const imageUrl = getAttachmentImageUrl(attachment);

        if (imageUrl) {
          return {
            id,
            type: "image",
            imageUrl,
          };
        }

        return null;
      })
      .filter(
        (attachment): attachment is RenderableAttachment => attachment != null,
      );

    if (renderableAttachments.length === 0) {
      return null;
    }

    return (
      <S.Attachments>
        {renderableAttachments.map((attachment) =>
          attachment.type === "image" ? (
            <Image
              width={200}
              key={attachment.id}
              alt="Message attachment"
              src={attachment.imageUrl}
            />
          ) : (
            <MessageMediaAttachment key={attachment.id} {...attachment.media} />
          ),
        )}
      </S.Attachments>
    );
  },
);

MessageAttachments.displayName = "MessageAttachments";
