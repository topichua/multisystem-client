import type { Client } from '@/features/clients/model/client.types';
import type { Conversation } from '@/features/conversations/model/types';

import { ClientContactsSection } from './client-contacts-section';
import { ClientLastOrderSection } from './client-last-order-section';
import { ClientOrdersSummary } from './client-order-summary';
import { ClientWishlistSection } from '../client-wishlist/client-wishlist-section';
import { Divider, Flex } from 'antd';

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
