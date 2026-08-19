import { Image } from "antd";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import { getInstagramPostPreview } from "@/features/conversations/utils/conversation-message-type";

import * as ItemS from "./message-item.styled";
import * as S from "./message-instagram-post-body.styled";
import type { MessageBodyProps } from "./message-body.types";

export const MessageInstagramPostBody = memo(
  ({ message, isOwn, timeLabel }: MessageBodyProps) => {
    const { t } = useTranslation();
    const { imageUrl, caption } = getInstagramPostPreview(message);
    const hasImage = imageUrl != null;

    return (
      <>
        {hasImage && (
          <S.PostImageWrap>
            <Image
              alt={caption || t("messages.instagramPostAria")}
              src={imageUrl}
              width="100%"
            />
          </S.PostImageWrap>
        )}
        <S.PostCaptionRow $hasAttachments={hasImage}>
          {caption ? (
            <S.PostCaption className="conversation-message-body">
              {caption}
            </S.PostCaption>
          ) : (
            <ItemS.TextTimeSpacer aria-hidden />
          )}
          {timeLabel !== "" && (
            <ItemS.Timestamp $isOwn={isOwn}>{timeLabel}</ItemS.Timestamp>
          )}
        </S.PostCaptionRow>
      </>
    );
  },
);

MessageInstagramPostBody.displayName = "MessageInstagramPostBody";
