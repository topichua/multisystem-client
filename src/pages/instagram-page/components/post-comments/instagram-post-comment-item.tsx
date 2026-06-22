import { Button, Typography } from "antd";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import type { InstagramComment } from "@/features/instagram/model/instagram.types";
import { formatRelativeTimeShort } from "@/utils/date-time";

import type { InstagramPostPageController } from "../../controllers/use-instagram-post-page-controller";
import {
  getAvatarLabel,
  getCommentAuthor,
  getCommentHandle,
  type OwnInstagramIdentity,
} from "../../utils/instagram-comment.utils";
import { InstagramPostCommentRepliesSection } from "./instagram-post-comment-replies-section";
import * as S from "./instagram-post-comments.styled";

const { Text } = Typography;

type InstagramPostCommentItemProps = {
  active: boolean;
  comment: InstagramComment;
  composer: ReactNode;
  ownIdentity: OwnInstagramIdentity;
  postId: string;
  store: InstagramPostPageController["store"];
  onReplyClick: (comment: InstagramComment) => void;
};

export const InstagramPostCommentItem = ({
  active,
  comment,
  composer,
  ownIdentity,
  postId,
  store,
  onReplyClick,
}: InstagramPostCommentItemProps) => {
  const { t } = useTranslation();
  const author = getCommentAuthor(comment);

  return (
    <S.Item $active={active}>
      <S.Row>
        <S.Avatar>{getAvatarLabel(author)}</S.Avatar>
        <S.Content>
          <S.Line>
            <Text strong>{getCommentHandle(comment)}</Text>{" "}
            <S.InlineText>{comment.text}</S.InlineText>
          </S.Line>
          <S.ActionRow>
            {comment.timestamp ? (
              <Text type="secondary">
                {formatRelativeTimeShort(comment.timestamp)}
              </Text>
            ) : null}
            <Button
              type="link"
              size="small"
              onClick={() => onReplyClick(comment)}
            >
              {t("instagram.reply")}
            </Button>
          </S.ActionRow>
          <InstagramPostCommentRepliesSection
            comment={comment}
            ownIdentity={ownIdentity}
            postId={postId}
            store={store}
          />
          {composer}
        </S.Content>
      </S.Row>
    </S.Item>
  );
};
