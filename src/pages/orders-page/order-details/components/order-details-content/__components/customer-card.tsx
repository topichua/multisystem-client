import { ArrowSquareOutIcon } from "@phosphor-icons/react";
import { Button, Card, Flex, Typography } from "antd";
import { observer } from "mobx-react-lite";

import { pagesMap } from "@/app/router/pages-map";
import { UserAvatar } from "@/components/user-avatar";
import { useClientDetails } from "@/pages/clients-page/client-details/hooks/use-client-details";
import { formatClientDisplayName } from "@/pages/clients-page/clients-list/client-display.utils";

import type { CustomerSectionProps } from "../order-details-content.types";

const { Text } = Typography;

export const CustomerCard = observer(
  ({ order, customerName, t }: CustomerSectionProps) => {
    const { client } = useClientDetails(order.customerId);
    const avatarName = client ? formatClientDisplayName(client) : customerName;
    const conversationId =
      order.conversationId ?? order.conversation?.id ?? null;
    const conversationHref =
      conversationId != null
        ? `${pagesMap.conversations}/${conversationId}`
        : undefined;

    return (
      <Card className="print-card" title={t("orders.customer")}>
        <Flex align="center" justify="space-between" gap={14} wrap>
          <Flex gap={12} style={{ minWidth: 0 }}>
            <UserAvatar
              size={44}
              name={avatarName}
              src={client?.avatar_src || undefined}
              style={{ flexShrink: 0 }}
            />
            <Flex vertical style={{ minWidth: 0 }}>
              <Text strong style={{ fontSize: 16 }}>
                {customerName}
              </Text>
              <Text type="secondary">{order.customer.phone}</Text>
            </Flex>
          </Flex>

          <Flex gap={8} wrap>
            {conversationHref && (
              <Button
                type="link"
                className="no-print"
                href={conversationHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("orders.details.openClientChat")}
              </Button>
            )}

            <Button
              type="link"
              className="no-print"
              icon={<ArrowSquareOutIcon size={16} />}
              href={pagesMap.clients}
            >
              {t("orders.details.clientProfile")}
            </Button>
          </Flex>
        </Flex>
      </Card>
    );
  },
);
