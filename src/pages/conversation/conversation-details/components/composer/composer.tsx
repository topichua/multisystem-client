import { SmileyIcon } from '@phosphor-icons/react';
import { Button, Input, Popover } from 'antd';
import type { TextAreaRef } from 'antd/es/input/TextArea';
import EmojiPicker, { EmojiStyle, Theme as EmojiPickerTheme } from 'emoji-picker-react';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { ReplyComposeTarget } from '../../reply-compose-target';
import { useThemeMode } from '@/theme/use-theme-mode';

import * as S from './composer.styled';

type ComposerProps = {
  draft: string;
  canSend: boolean;
  replyPreview: ReplyComposeTarget | null;
  onCancelReply: () => void;
  onDraftChange: (value: string) => void;
  onSend: () => void;
};

export const Composer = memo(
  ({ draft, canSend, replyPreview, onCancelReply, onDraftChange, onSend }: ComposerProps) => {
    const { t } = useTranslation();
    const { mode } = useThemeMode();
    const textareaRef = useRef<TextAreaRef>(null);
    const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

    const pickerTheme = useMemo(
      () => (mode === 'dark' ? EmojiPickerTheme.DARK : EmojiPickerTheme.LIGHT),
      [mode],
    );

    const insertEmoji = useCallback(
      (emoji: string) => {
        const ta = textareaRef.current?.resizableTextArea?.textArea;
        const start = ta?.selectionStart ?? draft.length;
        const end = ta?.selectionEnd ?? draft.length;
        const next = `${draft.slice(0, start)}${emoji}${draft.slice(end)}`;
        const caret = start + [...emoji].length;

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

        setEmojiPickerOpen(false);
      },
      [draft, onDraftChange],
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

    return (
      <S.Composer>
        {replyPreview != null && (
          <S.ReplyBanner>
            <S.ReplyBannerBody>
              <S.ReplyBannerAuthor>{replyPreview.authorLabel}</S.ReplyBannerAuthor>
              <S.ReplyBannerSnippet>{replyPreview.snippet}</S.ReplyBannerSnippet>
            </S.ReplyBannerBody>
            <Button
              type="text"
              size="small"
              onClick={onCancelReply}
              aria-label={t('composer.cancelReplyAria')}
              style={{ flexShrink: 0, color: 'inherit' }}
            >
              ×
            </Button>
          </S.ReplyBanner>
        )}

        <S.ComposerRow>
          <Input.TextArea
            ref={textareaRef}
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            placeholder={t('composer.placeholder')}
            autoSize={{ minRows: 1, maxRows: 4 }}
            onPressEnter={(event) => {
              if (!event.shiftKey) {
                event.preventDefault();
                onSend();
              }
            }}
            style={{ flex: 1, minWidth: 0 }}
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
              aria-label={t('composer.openEmojiPickerAria')}
              aria-expanded={emojiPickerOpen}
              icon={<SmileyIcon size={22} />}
              style={{ flexShrink: 0 }}
            />
          </Popover>

          <Button type="primary" disabled={!canSend} onClick={onSend}>
            {t('composer.send')}
          </Button>
        </S.ComposerRow>
      </S.Composer>
    );
  },
);

Composer.displayName = 'Composer';
