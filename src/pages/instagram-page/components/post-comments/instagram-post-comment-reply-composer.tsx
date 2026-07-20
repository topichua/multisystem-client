import {
  PaperPlaneTiltIcon,
  SmileyIcon,
  SparkleIcon,
  XIcon,
} from "@phosphor-icons/react";
import {
  Alert,
  Button,
  Flex,
  Input,
  Popover,
  Typography,
  type MenuProps,
} from "antd";
import type { TextAreaRef } from "antd/es/input/TextArea";
import type { ReactNode, RefObject } from "react";
import { useTranslation } from "react-i18next";

import type { InstagramComment } from "@/features/instagram/model/instagram.types";

import { InstagramPostCommentTemplatesDropdown } from "./instagram-post-comment-templates-dropdown";
import * as S from "./instagram-post-comments.styled";

const { Text } = Typography;

type InstagramPostCommentReplyComposerProps = {
  comment: InstagramComment;
  draft: string;
  emojiPickerContent: ReactNode;
  emojiPickerOpen: boolean;
  menuItems: MenuProps["items"];
  sendingCommentId: string | null;
  submitError: string | null;
  targetAuthor: string;
  textareaRef: RefObject<TextAreaRef | null>;
  onCancelReply: () => void;
  onDraftChange: (value: string) => void;
  onEmojiOpenChange: (open: boolean) => void;
  onSendReply: () => void;
  onTemplateMenuClick: MenuProps["onClick"];
  onTemplateOpenChange: (open: boolean) => void;
};

export const InstagramPostCommentReplyComposer = ({
  comment,
  draft,
  emojiPickerContent,
  emojiPickerOpen,
  menuItems,
  sendingCommentId,
  submitError,
  targetAuthor,
  textareaRef,
  onCancelReply,
  onDraftChange,
  onEmojiOpenChange,
  onSendReply,
  onTemplateMenuClick,
  onTemplateOpenChange,
}: InstagramPostCommentReplyComposerProps) => {
  const { t } = useTranslation();
  const sending = sendingCommentId === comment.id;

  return (
    <S.ReplyComposer>
      <S.ReplyTarget>
        <S.ReplyTargetIcon>↩</S.ReplyTargetIcon>
        <Text type="secondary">
          {t("instagram.replyTo")} <Text strong>{targetAuthor}</Text>
        </Text>
        <Button
          type="text"
          size="small"
          icon={<XIcon size={14} />}
          aria-label={t("instagram.cancelReply")}
          onClick={onCancelReply}
        />
      </S.ReplyTarget>

      {submitError && (
        <Alert type="error" showIcon message={submitError} />
      )}

      <S.EditorShell>
        <Input.TextArea
          ref={textareaRef}
          value={draft}
          autoSize={{ minRows: 3, maxRows: 5 }}
          placeholder={t("instagram.replyPlaceholder")}
          variant="borderless"
          onChange={(event) => onDraftChange(event.target.value)}
        />

        <S.ComposerFooter>
          <Flex align="center" gap={8}>
            <InstagramPostCommentTemplatesDropdown
              items={menuItems}
              onMenuClick={onTemplateMenuClick}
              onOpenChange={onTemplateOpenChange}
            />
            <Button variant="outlined" icon={<SparkleIcon size={16} />}>
              AI
            </Button>
          </Flex>

          <Flex align="center" gap={6}>
            <Popover
              trigger="click"
              placement="topRight"
              open={emojiPickerOpen}
              onOpenChange={onEmojiOpenChange}
              destroyOnHidden
              content={emojiPickerContent}
            >
              <Button
                type="text"
                aria-label={t("composer.openEmojiPickerAria")}
                aria-expanded={emojiPickerOpen}
                icon={<SmileyIcon size={20} />}
              />
            </Popover>

            <Button
              className="instagram-comment-send-button"
              icon={<PaperPlaneTiltIcon size={18} weight="fill" />}
              aria-label={t("instagram.sendReply")}
              aria-busy={sending}
              disabled={draft.trim() === "" || sending}
              loading={sending}
              type="primary"
              onClick={onSendReply}
            />
          </Flex>
        </S.ComposerFooter>
      </S.EditorShell>
    </S.ReplyComposer>
  );
};
