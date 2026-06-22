import { useTranslation } from "react-i18next";

import type { InstagramPostPageController } from "../../controllers/use-instagram-post-page-controller";
import {
  InstagramPostComments,
  InstagramPostCommentsHeader,
} from "../post-comments/instagram-post-comments";
import * as S from "./instagram-post-detail-content.styled";

type InstagramPostCommentsPanelProps = {
  commentsOpen: boolean;
  controller: InstagramPostPageController;
  postId: string;
  onClose: () => void;
};

export const InstagramPostCommentsPanel = ({
  commentsOpen,
  controller,
  postId,
  onClose,
}: InstagramPostCommentsPanelProps) => {
  const { t } = useTranslation();

  if (!commentsOpen) {
    return null;
  }

  return (
    <>
      <S.HeaderComments>
        <InstagramPostCommentsHeader
          controller={controller}
          onClose={onClose}
          postId={postId}
        />
      </S.HeaderComments>
      <S.CommentsPanel aria-label={t("instagram.comments")}>
        <InstagramPostComments controller={controller} postId={postId} />
      </S.CommentsPanel>
    </>
  );
};
