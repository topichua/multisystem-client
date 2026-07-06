import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";

import type { ReplyComposeTarget } from "../../reply-compose-target";

import { ComposerToolbar, type ComposerTab } from "./composer-toolbar";
import { MessageComposer } from "./message-composer";
import { NoteComposer } from "./note-composer";
import * as S from "./composer.styled";

type ComposerProps = {
  conversationId: string;
  draft: string;
  canSend: boolean;
  hasLinkedClient: boolean;
  clientLookupLoading: boolean;
  replyPreview: ReplyComposeTarget | null;
  onCancelReply: () => void;
  onDraftChange: (value: string) => void;
  onSend: () => void;
};

export const Composer = observer(
  ({
    conversationId,
    draft,
    canSend,
    hasLinkedClient,
    clientLookupLoading,
    replyPreview,
    onCancelReply,
    onDraftChange,
    onSend,
  }: ComposerProps) => {
    const [activeTab, setActiveTab] = useState<ComposerTab>("messages");
    const [noteDraft, setNoteDraft] = useState("");

    useEffect(() => {
      setActiveTab("messages");
      setNoteDraft("");
    }, [conversationId]);

    return (
      <S.Composer>
        <ComposerToolbar
          activeTab={activeTab}
          hasLinkedClient={hasLinkedClient}
          clientLookupLoading={clientLookupLoading}
          onTabChange={setActiveTab}
        />

        {activeTab === "note" ? (
          <NoteComposer draft={noteDraft} onDraftChange={setNoteDraft} />
        ) : (
          <MessageComposer
            draft={draft}
            canSend={canSend}
            replyPreview={replyPreview}
            onCancelReply={onCancelReply}
            onDraftChange={onDraftChange}
            onSend={onSend}
          />
        )}
      </S.Composer>
    );
  },
);

Composer.displayName = "Composer";
