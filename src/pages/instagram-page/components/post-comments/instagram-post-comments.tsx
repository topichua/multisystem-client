import { XIcon } from "@phosphor-icons/react";
import { Alert, Button, Empty, Spin, Typography, type MenuProps } from "antd";
import type { TextAreaRef } from "antd/es/input/TextArea";
import EmojiPicker, {
  EmojiStyle,
  Theme as EmojiPickerTheme,
} from "emoji-picker-react";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { useMessageTemplatesStore } from "@/features/message-templates/model/use-message-templates-store";
import type { InstagramComment } from "@/features/instagram/model/instagram.types";
import { useThemeMode } from "@/theme/use-theme-mode";
import { unknownErrorMessage } from "@/utils/unknown-error-message";

import type { InstagramPostPageController } from "../../controllers/use-instagram-post-page-controller";
import {
  getCommentHandle,
  hasSentReply,
  type OwnInstagramIdentity,
} from "../../utils/instagram-comment.utils";
import { InstagramPostCommentItem } from "./instagram-post-comment-item";
import { InstagramPostCommentReplyComposer } from "./instagram-post-comment-reply-composer";
import * as S from "./instagram-post-comments.styled";

const { Text } = Typography;

type InstagramPostCommentsProps = {
  controller: InstagramPostPageController;
  postId: string;
};

type InstagramPostCommentsHeaderProps = InstagramPostCommentsProps & {
  onClose: () => void;
};

export const InstagramPostCommentsHeader = observer(
  ({ controller, postId, onClose }: InstagramPostCommentsHeaderProps) => {
    const { t } = useTranslation();
    const { store } = controller;
    const comments = store.getPostComments(postId);
    const ownIdentity: OwnInstagramIdentity = {
      id: store.selectedIntegration?.business_account_id,
      username: store.selectedIntegration?.username,
    };
    const unansweredCount = comments.filter(
      (comment) =>
        !hasSentReply(store.getCommentReplies(comment.id), ownIdentity),
    ).length;

    return (
      <S.HeaderContent>
        <Text strong>{t("instagram.comments")}</Text>
        <S.UnansweredPill>
          {unansweredCount} {t("instagram.unanswered")}
        </S.UnansweredPill>
        <Button
          type="text"
          size="small"
          icon={<XIcon size={16} />}
          aria-label={t("instagram.closeComments")}
          onClick={onClose}
        />
      </S.HeaderContent>
    );
  },
);

export const InstagramPostComments = observer(
  ({ controller, postId }: InstagramPostCommentsProps) => {
    const { t } = useTranslation();
    const { mode } = useThemeMode();
    const { store } = controller;
    const templatesStore = useMessageTemplatesStore();
    const textareaRef = useRef<TextAreaRef>(null);
    const comments = store.getPostComments(postId);
    const loading = store.isPostCommentsLoading(postId);
    const loadingMore = store.isPostCommentsLoadingMore(postId);
    const error = store.getPostCommentsError(postId);
    const canLoadMore = store.canLoadNextPostCommentsPage(postId);
    const ownIdentity: OwnInstagramIdentity = {
      id: store.selectedIntegration?.business_account_id,
      username: store.selectedIntegration?.username,
    };
    const [replyTarget, setReplyTarget] = useState<InstagramComment | null>(
      null,
    );
    const [draft, setDraft] = useState("");
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

    const pickerTheme = useMemo(
      () => (mode === "dark" ? EmojiPickerTheme.DARK : EmojiPickerTheme.LIGHT),
      [mode],
    );

    useEffect(() => {
      void store.loadPostComments(postId);
    }, [postId, store, store.selectedIntegrationId]);

    useEffect(() => {
      if (!replyTarget) {
        return;
      }

      requestAnimationFrame(() => {
        textareaRef.current?.focus();
      });
    }, [replyTarget]);

    const targetAuthor = useMemo(
      () => (replyTarget ? getCommentHandle(replyTarget) : ""),
      [replyTarget],
    );

    const cancelReply = () => {
      setReplyTarget(null);
      setDraft("");
      setSubmitError(null);
      setEmojiPickerOpen(false);
    };

    const insertText = useCallback(
      (text: string) => {
        const ta = textareaRef.current?.resizableTextArea?.textArea;
        const start = ta?.selectionStart ?? draft.length;
        const end = ta?.selectionEnd ?? draft.length;
        const next = `${draft.slice(0, start)}${text}${draft.slice(end)}`;
        const caret = start + text.length;

        setDraft(next);

        queueMicrotask(() => {
          requestAnimationFrame(() => {
            const el = textareaRef.current?.resizableTextArea?.textArea;
            if (el) {
              el.focus();
              el.setSelectionRange(caret, caret);
            }
          });
        });
      },
      [draft],
    );

    const insertEmoji = useCallback(
      (emoji: string) => {
        insertText(emoji);
        setEmojiPickerOpen(false);
      },
      [insertText],
    );

    const emojiPickerContent = (
      <S.EmojiPickerPopoverBody data-qa="instagram-comment-emoji-picker">
        <EmojiPicker
          theme={pickerTheme}
          emojiStyle={EmojiStyle.NATIVE}
          width={320}
          height={380}
          previewConfig={{ showPreview: false }}
          onEmojiClick={(emojiData) => {
            insertEmoji(emojiData.emoji);
          }}
        />
      </S.EmojiPickerPopoverBody>
    );

    const templateMenuItems = useMemo<MenuProps["items"]>(() => {
      if (templatesStore.listLoading && templatesStore.templates.length === 0) {
        return [
          {
            key: "loading",
            label: t("instagram.loadingTemplates"),
            disabled: true,
          },
        ];
      }

      if (templatesStore.templates.length === 0) {
        return [
          {
            key: "empty",
            label: t("templates.emptyState"),
            disabled: true,
          },
        ];
      }

      return [...templatesStore.templates]
        .sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
        )
        .map((template) => ({
          key: String(template.id),
          label: template.name,
        }));
    }, [t, templatesStore.listLoading, templatesStore.templates]);

    const handleTemplateDropdownOpen = (open: boolean) => {
      if (
        open &&
        templatesStore.templates.length === 0 &&
        !templatesStore.listLoading
      ) {
        void templatesStore.loadTemplates();
      }
    };

    const handleTemplateMenuClick: MenuProps["onClick"] = ({ key }) => {
      const template = templatesStore.templates.find(
        (item) => String(item.id) === key,
      );

      if (template) {
        insertText(template.template);
      }
    };

    const openReply = (comment: InstagramComment) => {
      setReplyTarget(comment);
      setDraft("");
      setSubmitError(null);
      setEmojiPickerOpen(false);
    };

    const sendReply = async () => {
      if (!replyTarget || draft.trim() === "") {
        return;
      }

      const target = replyTarget;
      const message = draft;
      setSubmitError(null);
      cancelReply();

      void store.sendCommentReply(postId, target.id, message).catch((e) => {
        setReplyTarget(target);
        setDraft(message);
        setSubmitError(unknownErrorMessage(e));
      });
    };

    const getComposer = (comment: InstagramComment) => {
      if (replyTarget?.id !== comment.id) {
        return null;
      }

      return (
        <InstagramPostCommentReplyComposer
          comment={comment}
          draft={draft}
          emojiPickerContent={emojiPickerContent}
          emojiPickerOpen={emojiPickerOpen}
          menuItems={templateMenuItems}
          sendingCommentId={store.commentReplySendingCommentId}
          submitError={submitError}
          targetAuthor={targetAuthor}
          textareaRef={textareaRef}
          onCancelReply={cancelReply}
          onDraftChange={setDraft}
          onEmojiOpenChange={setEmojiPickerOpen}
          onSendReply={sendReply}
          onTemplateMenuClick={handleTemplateMenuClick}
          onTemplateOpenChange={handleTemplateDropdownOpen}
        />
      );
    };

    if (loading && comments.length === 0) {
      return (
        <S.Centered>
          <Spin />
        </S.Centered>
      );
    }

    if (error && comments.length === 0) {
      return (
        <S.Body>
          <Alert type="error" showIcon message={error} />
        </S.Body>
      );
    }

    return (
      <S.Body>
        {comments.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t("instagram.noComments")}
          />
        ) : (
          <S.List>
            {comments.map((comment) => (
              <InstagramPostCommentItem
                active={replyTarget?.id === comment.id}
                comment={comment}
                composer={getComposer(comment)}
                key={comment.id}
                ownIdentity={ownIdentity}
                postId={postId}
                store={store}
                onReplyClick={openReply}
              />
            ))}
          </S.List>
        )}

        {error && comments.length > 0 && (
          <Alert type="error" showIcon message={error} />
        )}

        {canLoadMore && (
          <Button
            block
            loading={loadingMore}
            onClick={() => store.loadPostComments(postId, true)}
          >
            {t("instagram.loadMoreComments")}
          </Button>
        )}
      </S.Body>
    );
  },
);
