import { Divider, Flex } from "antd";

import type { Client } from "@/features/clients/model/client.types";
import type { Conversation } from "@/features/conversations/model/types";

import { ClientWishlistSection } from "../client-wishlist/client-wishlist-section";
import { ClientBlockedBanner } from "./client-blocked-banner";
import { ClientContactsSection } from "./client-contacts-section";
import { ClientLastOrderSection } from "./client-last-order-section";
import { ClientOrdersSummary } from "./client-order-summary";

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
    <Flex vertical>
      <ClientBlockedBanner client={client} onClientUpdated={onClientUpdated} />

      <ClientContactsSection
        client={client}
        conversation={conversation}
        onClientUpdated={onClientUpdated}
        onCurrentConversationUnlinked={onCurrentConversationUnlinked}
      />

      <Divider />

      <ClientWishlistSection
        clientId={client.id}
        conversationId={conversation.id}
      />

      <Divider />

      <ClientOrdersSummary clientId={client.id} />

      <Divider />

      <ClientLastOrderSection clientId={client.id} />
    </Flex>
  );
}
