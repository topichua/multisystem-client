import { PaperPlaneTiltIcon } from "@phosphor-icons/react";
import { Button, Flex, Input } from "antd";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import * as S from "./composer.styled";

type NoteComposerProps = {
  draft: string;
  onDraftChange: (value: string) => void;
};

export function NoteComposer({ draft, onDraftChange }: NoteComposerProps) {
  const { t } = useTranslation();
  const canSend = Boolean(draft.trim());

  const handleSend = useCallback(() => {
    if (!canSend) {
      return;
    }
  }, [canSend]);

  return (
    <S.EditorShell data-qa="layout-conversation-details-note-composer">
      <Input.TextArea
        value={draft}
        onChange={(event) => onDraftChange(event.target.value)}
        placeholder={t("composer.notePlaceholder")}
        autoSize={{ minRows: 2, maxRows: 6 }}
        variant="borderless"
        onPressEnter={(event) => {
          if (event.metaKey || event.ctrlKey) {
            event.preventDefault();
            handleSend();
          }
        }}
      />

      <Flex justify="flex-end" align="center" style={{ marginTop: 8 }}>
        <Button
          type="primary"
          disabled={!canSend}
          onClick={handleSend}
          icon={<PaperPlaneTiltIcon size={16} weight="fill" />}
        >
          {t("composer.send")}
        </Button>
      </Flex>
    </S.EditorShell>
  );
}
