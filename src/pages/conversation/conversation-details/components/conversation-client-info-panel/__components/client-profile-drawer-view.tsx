import { ArrowLineUpRightIcon } from "@phosphor-icons/react";
import { Button } from "antd";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { getClientDetailsPath } from "@/app/router/pages-map";
import type { Client } from "@/features/clients/model/client.types";
import type { Conversation } from "@/features/conversations/model/types";

import { ClientContactsSection } from "./client-contacts-section";
import { ClientLastOrderSection } from "./client-last-order-section";
import { ClientOrdersSummary } from "./client-order-summary";
import { ClientProfileHeader } from "./client-profile-header";
import * as S from "../conversation-client-info-panel.styled";

type ClientProfileDrawerViewProps = {
  client: Client;
  conversation: Conversation;
  onClientUpdated: (client: Client) => void;
  onCurrentConversationUnlinked: () => void;
};

export function ClientProfileDrawerView({
  client,
  conversation,
  onClientUpdated,
  onCurrentConversationUnlinked,
}: ClientProfileDrawerViewProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleOpenFullProfile = useCallback(() => {
    navigate(getClientDetailsPath(client.id));
  }, [client.id, navigate]);

  return (
    <S.ProfileDrawerContent>
      <ClientProfileHeader client={client} conversation={conversation} />

      <ClientContactsSection
        client={client}
        conversation={conversation}
        onClientUpdated={onClientUpdated}
        onCurrentConversationUnlinked={onCurrentConversationUnlinked}
      />

      <ClientOrdersSummary clientId={client.id} />

      <ClientLastOrderSection clientId={client.id} />

      <Button
        variant="outlined"
        block
        onClick={handleOpenFullProfile}
        icon={<ArrowLineUpRightIcon />}
      >
        {t("conversation.clientProfile.fullProfile")}
      </Button>
    </S.ProfileDrawerContent>
  );
}
