import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";

import type { ClientLastOrder } from "@/features/orders/model/order.types";

import type { ReplyComposeTarget } from "../../reply-compose-target";

import { ComposerToolbar, type ComposerTab } from "./composer-toolbar";
import * as S from "./composer.styled";
import { MessageComposer } from "./message-composer";
import { NoteComposer } from "./note-composer";

type ComposerProps = {
  conversationId: string;
  draft: string;
  canSend: boolean;
  hasLinkedClient: boolean;
  clientLookupLoading: boolean;
  clientLastOrder: ClientLastOrder | null;
  clientLastOrderLoading: boolean;
  replyPreview: ReplyComposeTarget | null;
  onCancelReply: () => void;
  onCreateOrderClick: () => void;
  onDraftChange: (value: string) => void;
  onLastOrderOpen: (orderId: number) => void;
  onSend: () => void;
};

export const Composer = observer(
  ({
    conversationId,
    draft,
    canSend,
    hasLinkedClient,
    clientLookupLoading,
    clientLastOrder,
    clientLastOrderLoading,
    replyPreview,
    onCancelReply,
    onCreateOrderClick,
    onDraftChange,
    onLastOrderOpen,
    onSend,
  }: ComposerProps) => {
    const [activeTab, setActiveTab] = useState<ComposerTab>("messages");
    const [noteDraft, setNoteDraft] = useState("");

    useEffect(() => {
      setActiveTab("messages");
      setNoteDraft("");
    }, [conversationId]);

    return (
      <S.ComposerContent>
        <ComposerToolbar
          activeTab={activeTab}
          hasLinkedClient={hasLinkedClient}
          clientLookupLoading={clientLookupLoading}
          clientLastOrder={clientLastOrder}
          clientLastOrderLoading={clientLastOrderLoading}
          onCreateOrderClick={onCreateOrderClick}
          onLastOrderOpen={onLastOrderOpen}
          onTabChange={setActiveTab}
        />

        {activeTab === "note" ? (
          <NoteComposer draft={noteDraft} onDraftChange={setNoteDraft} />
        ) : (
          <MessageComposer
            conversationId={conversationId}
            draft={draft}
            canSend={canSend}
            replyPreview={replyPreview}
            onCancelReply={onCancelReply}
            onDraftChange={onDraftChange}
            onSend={onSend}
          />
        )}
      </S.ComposerContent>
    );
  },
);

Composer.displayName = "Composer";
