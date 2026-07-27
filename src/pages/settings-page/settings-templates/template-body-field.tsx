import { SmileyIcon } from "@phosphor-icons/react";
import { Button, Input, Popover, Typography } from "antd";
import type { TextAreaProps, TextAreaRef } from "antd/es/input/TextArea";
import EmojiPicker, {
  EmojiStyle,
  Theme as EmojiPickerTheme,
} from "emoji-picker-react";
import { useCallback, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { useThemeMode } from "@/theme/use-theme-mode";

import * as S from "./template-body-field.styled";

const { Text } = Typography;

const renderMutedIcon = (children: ReactNode) => (
  <Text type="secondary" style={{ display: "inline-flex" }}>
    {children}
  </Text>
);

type TemplateBodyFieldProps = {
  value?: string;
  onChange?: (value: string) => void;
  rows?: number;
  autoSize?: TextAreaProps["autoSize"];
  placeholder?: string;
  "data-qa"?: string;
};

export const TemplateBodyField = ({
  value = "",
  onChange,
  rows = 6,
  autoSize,
  placeholder,
  "data-qa": dataQa = "template-body-field",
}: TemplateBodyFieldProps) => {
  const { t } = useTranslation();
  const { mode } = useThemeMode();
  const textareaRef = useRef<TextAreaRef>(null);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  const pickerTheme = useMemo(
    () => (mode === "dark" ? EmojiPickerTheme.DARK : EmojiPickerTheme.LIGHT),
    [mode],
  );

  const insertEmoji = useCallback(
    (emoji: string) => {
      const ta = textareaRef.current?.resizableTextArea?.textArea;
      const start = ta?.selectionStart ?? value.length;
      const end = ta?.selectionEnd ?? value.length;
      const next = `${value.slice(0, start)}${emoji}${value.slice(end)}`;
      const caret = start + emoji.length;

      onChange?.(next);
      setEmojiPickerOpen(false);

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
    [onChange, value],
  );

  const emojiPickerContent = (
    <S.EmojiPickerPopoverBody data-qa={`${dataQa}-emoji-picker`}>
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
    <S.FieldShell data-qa={dataQa}>
      <Input.TextArea
        ref={textareaRef}
        value={value}
        rows={rows}
        autoSize={autoSize}
        placeholder={placeholder}
        variant="borderless"
        onChange={(event) => onChange?.(event.target.value)}
      />

      <S.Toolbar>
        <Popover
          trigger="click"
          placement="topLeft"
          open={emojiPickerOpen}
          onOpenChange={setEmojiPickerOpen}
          destroyOnHidden
          getPopupContainer={() => document.body}
          content={emojiPickerContent}
        >
          <Button
            type="text"
            aria-label={t("composer.openEmojiPickerAria")}
            aria-expanded={emojiPickerOpen}
            data-qa={`${dataQa}-emoji-button`}
            icon={renderMutedIcon(<SmileyIcon size={18} />)}
          />
        </Popover>
      </S.Toolbar>
    </S.FieldShell>
  );
};
