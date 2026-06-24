import {
  ImageSquareIcon,
  LightningIcon,
  PaperclipIcon,
  PaperPlaneTiltIcon,
  SmileyIcon,
  SparkleIcon,
  StackIcon,
} from "@phosphor-icons/react";
import {
  Button,
  Dropdown,
  Flex,
  Input,
  Popover,
  Typography,
  type MenuProps,
} from "antd";
import type { TextAreaRef } from "antd/es/input/TextArea";
import EmojiPicker, {
  EmojiStyle,
  Theme as EmojiPickerTheme,
} from "emoji-picker-react";
import { observer } from "mobx-react-lite";
import { useCallback, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import type { ReplyComposeTarget } from "../../reply-compose-target";
import { useMessageTemplatesStore } from "@/features/message-templates/model/use-message-templates-store";
import { useThemeMode } from "@/theme/use-theme-mode";

import * as S from "./composer.styled";

const { Text } = Typography;

const renderMutedIcon = (children: ReactNode) => (
  <Text type="secondary" style={{ display: "inline-flex" }}>
    {children}
  </Text>
);

type ComposerProps = {
  draft: string;
  canSend: boolean;
  replyPreview: ReplyComposeTarget | null;
  onCancelReply: () => void;
  onDraftChange: (value: string) => void;
  onSend: () => void;
};

export const Composer = observer(
  ({
    draft,
    canSend,
    replyPreview,
    onCancelReply,
    onDraftChange,
    onSend,
  }: ComposerProps) => {
    const { t } = useTranslation();
    const { mode } = useThemeMode();
    const templatesStore = useMessageTemplatesStore();
    const textareaRef = useRef<TextAreaRef>(null);
    const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

    const pickerTheme = useMemo(
      () => (mode === "dark" ? EmojiPickerTheme.DARK : EmojiPickerTheme.LIGHT),
      [mode],
    );

    const insertText = useCallback(
      (text: string) => {
        const ta = textareaRef.current?.resizableTextArea?.textArea;
        const start = ta?.selectionStart ?? draft.length;
        const end = ta?.selectionEnd ?? draft.length;
        const next = `${draft.slice(0, start)}${text}${draft.slice(end)}`;
        const caret = start + text.length;

        onDraftChange(next);

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
      [draft, onDraftChange],
    );

    const insertEmoji = useCallback(
      (emoji: string) => {
        insertText(emoji);
        setEmojiPickerOpen(false);
      },
      [insertText],
    );

    const emojiPickerContent = (
      <S.EmojiPickerPopoverBody data-qa="composer-emoji-picker">
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
            label: t("composer.loadingTemplates"),
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

    const templatesById = useMemo(
      () =>
        new Map(
          templatesStore.templates.map((template) => [
            String(template.id),
            template,
          ]),
        ),
      [templatesStore.templates],
    );

    const handleTemplateDropdownOpen = useCallback(
      (open: boolean) => {
        if (
          open &&
          templatesStore.templates.length === 0 &&
          !templatesStore.listLoading
        ) {
          void templatesStore.loadTemplates();
        }
      },
      [templatesStore],
    );

    const handleTemplateMenuClick: MenuProps["onClick"] = useCallback(
      ({ key }) => {
        const template = templatesById.get(key);

        if (template) {
          insertText(template.template);
        }
      },
      [insertText, templatesById],
    );

    const handleSend = useCallback(() => {
      if (canSend) {
        onSend();
      }
    }, [canSend, onSend]);

    return (
      <S.Composer>
        {replyPreview != null && (
          <S.ReplyBanner>
            <S.ReplyBannerBody>
              <S.ReplyBannerAuthor>
                {replyPreview.authorLabel}
              </S.ReplyBannerAuthor>
              <S.ReplyBannerSnippet>
                {replyPreview.snippet}
              </S.ReplyBannerSnippet>
            </S.ReplyBannerBody>
            <Button
              type="text"
              size="small"
              onClick={onCancelReply}
              aria-label={t("composer.cancelReplyAria")}
              style={{ flexShrink: 0, color: "inherit" }}
            >
              ×
            </Button>
          </S.ReplyBanner>
        )}

        <S.EditorShell>
          <Input.TextArea
            ref={textareaRef}
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            placeholder={t("composer.placeholder")}
            autoSize={{ minRows: 2, maxRows: 6 }}
            variant="borderless"
            onPressEnter={(event) => {
              if (!event.shiftKey) {
                event.preventDefault();
                handleSend();
              }
            }}
          />

          <Flex justify="space-between" align="center" gap={12} wrap>
            <Flex align="center">
              <Button
                type="text"
                aria-label={t("composer.attachFileAria")}
                icon={renderMutedIcon(<PaperclipIcon size={18} />)}
              />
              <Button
                type="text"
                aria-label={t("composer.attachImageAria")}
                icon={renderMutedIcon(<ImageSquareIcon size={18} />)}
              />
              <Popover
                trigger="click"
                placement="topRight"
                open={emojiPickerOpen}
                onOpenChange={setEmojiPickerOpen}
                destroyOnHidden
                content={emojiPickerContent}
              >
                <Button
                  type="text"
                  aria-label={t("composer.openEmojiPickerAria")}
                  aria-expanded={emojiPickerOpen}
                  icon={renderMutedIcon(<SmileyIcon size={18} />)}
                />
              </Popover>
              <Button
                type="text"
                aria-label={t("composer.quickActionAria")}
                icon={renderMutedIcon(<LightningIcon size={18} />)}
              />
            </Flex>

            <Flex align="center" gap={8} wrap>
              <Dropdown
                trigger={["click"]}
                placement="topRight"
                menu={{
                  items: templateMenuItems,
                  onClick: handleTemplateMenuClick,
                }}
                onOpenChange={handleTemplateDropdownOpen}
              >
                <Button icon={<StackIcon size={16} />}>
                  {t("composer.templates")}
                </Button>
              </Dropdown>
              <Button icon={<SparkleIcon size={16} />}>
                {t("composer.aiReply")}
              </Button>
              <Button
                type="primary"
                disabled={!canSend}
                onClick={handleSend}
                icon={<PaperPlaneTiltIcon size={16} weight="fill" />}
              >
                {t("composer.send")}
              </Button>
            </Flex>
          </Flex>
        </S.EditorShell>
      </S.Composer>
    );
  },
);

Composer.displayName = "Composer";
