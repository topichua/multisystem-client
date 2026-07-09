import { XIcon } from "@phosphor-icons/react";
import { Button, Flex, Typography } from "antd";
import { useTranslation } from "react-i18next";

import { UserAvatar } from "@/components/user-avatar";
import type { Client } from "@/features/clients/model/client.types";
import { formatClientDisplayName } from "@/pages/clients-page/clients-list/client-display.utils";

import * as S from "../../orders-new-page.styled";
import { renderClientMeta } from "../../orders-new.utils";

const { Text } = Typography;

type SelectedClientCardProps = {
  client: Client;
  onClear: () => void;
};

export function SelectedClientCard({
  client,
  onClear,
}: SelectedClientCardProps) {
  const { t } = useTranslation();

  return (
    <S.SelectedClientCard align="center" gap={12}>
      <UserAvatar
        size={42}
        name={formatClientDisplayName(client)}
        src={client.avatar_src}
      />

      <Flex vertical style={{ minWidth: 0, flex: 1 }}>
        <Text strong ellipsis>
          {formatClientDisplayName(client)}
        </Text>

        <Text type="secondary" ellipsis>
          {renderClientMeta(client)}
        </Text>
      </Flex>

      <Button
        type="text"
        icon={<XIcon size={16} />}
        aria-label={t("orders.create.client.clearSelectedAria")}
        onClick={onClear}
      />
    </S.SelectedClientCard>
  );
}
