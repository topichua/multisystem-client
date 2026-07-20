import { Alert, Button, Typography } from "antd";
import { Observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

import type { InstagramComment } from "@/features/instagram/model/instagram.types";

import type { InstagramPostPageController } from "../../controllers/use-instagram-post-page-controller";
import {
  getAvatarLabel,
  getCommentAuthor,
  getCommentAvatarUrl,
  getReplyAuthorLabel,
  isOwnReply,
  type OwnInstagramIdentity,
} from "../../utils/instagram-comment.utils";
import * as S from "./instagram-post-comments.styled";

const { Text } = Typography;

type InstagramPostCommentRepliesSectionProps = {
  comment: InstagramComment;
  ownIdentity: OwnInstagramIdentity;
  postId: string;
  store: InstagramPostPageController["store"];
};

export const InstagramPostCommentRepliesSection = ({
  comment,
  ownIdentity,
  postId,
  store,
}: InstagramPostCommentRepliesSectionProps) => {
  const { t } = useTranslation();

  return (
    <Observer>
      {() => {
        const replies = store.getCommentReplies(comment.id);
        const repliesError = store.getCommentRepliesError(comment.id);
        const repliesLoading = store.isCommentRepliesLoading(comment.id);
        const canLoadMoreReplies = store.canLoadNextCommentRepliesPage(
          comment.id,
        );
        const hasReplies = Boolean(comment.has_replies || comment.reply_count);

        if (!hasReplies && replies.length === 0) {
          return null;
        }

        return (
          <S.Replies>
            {replies.length === 0 && (
              <Button
                size="small"
                type="link"
                loading={repliesLoading}
                onClick={() => store.loadCommentReplies(postId, comment.id)}
              >
                {t("instagram.showReplies", {
                  count: comment.reply_count ?? 0,
                })}
              </Button>
            )}

            {repliesError && (
              <Alert type="error" showIcon message={repliesError} />
            )}

            {replies.map((reply) => {
              const ownReply = isOwnReply(reply, ownIdentity);

              return (
                <S.ReplyItem $optimistic={reply.optimistic} key={reply.id}>
                  {!ownReply && (
                    <S.ReplyAvatar>
                      {getCommentAvatarUrl(reply) ? (
                        <S.AvatarImage
                          src={getCommentAvatarUrl(reply)}
                          alt={getCommentAuthor(reply)}
                        />
                      ) : (
                        getAvatarLabel(getCommentAuthor(reply))
                      )}
                    </S.ReplyAvatar>
                  )}
                  <S.ReplyContent>
                    <Text strong>
                      {getReplyAuthorLabel(
                        reply,
                        ownIdentity,
                        t("instagram.you"),
                      )}
                    </Text>{" "}
                    <S.ReplyText>{reply.text}</S.ReplyText>
                  </S.ReplyContent>
                </S.ReplyItem>
              );
            })}

            {canLoadMoreReplies && (
              <Button
                size="small"
                type="link"
                loading={repliesLoading}
                onClick={() =>
                  store.loadCommentReplies(postId, comment.id, true)
                }
              >
                {t("instagram.loadMoreReplies")}
              </Button>
            )}
          </S.Replies>
        );
      }}
    </Observer>
  );
};
