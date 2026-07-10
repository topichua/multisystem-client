import type { Client } from "@/features/clients/model/client.types";
import type { Conversation } from "@/features/conversations/model/types";

import { ClientContactsSection } from "./client-contacts-section";
import { ClientLastOrderSection } from "./client-last-order-section";
import { ClientOrdersSummary } from "./client-order-summary";
import { ClientWishlistSection } from "./client-wishlist-section";
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
  return (
    <S.ProfileDrawerContent>
      <ClientContactsSection
        client={client}
        conversation={conversation}
        onClientUpdated={onClientUpdated}
        onCurrentConversationUnlinked={onCurrentConversationUnlinked}
      />

      <ClientWishlistSection />

      <ClientOrdersSummary clientId={client.id} />

      <ClientLastOrderSection clientId={client.id} />
    </S.ProfileDrawerContent>
  );
}
