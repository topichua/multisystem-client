import { Empty, List, Spin, Typography } from "antd";
import { useTranslation } from "react-i18next";

import type { Client } from "@/features/clients/model/client.types";

import * as S from "../../orders-new-page.styled";
import { ClientSearchListItem } from "./client-search-list-item";

const { Text } = Typography;

type ClientSearchResultsProps = {
  clientsListError: string | null;
  clientsListLoading: boolean;
  clientsRequested: boolean;
  onClientSelect: (client: Client) => void;
  visibleClients: Client[];
};

export function ClientSearchResults({
  clientsRequested,
  clientsListLoading,
  clientsListError,
  visibleClients,
  onClientSelect,
}: ClientSearchResultsProps) {
  const { t } = useTranslation();

  if (!clientsRequested) {
    return null;
  }

  if (clientsListLoading) {
    return (
      <S.ClientList>
        <S.ClientListState>
          <Spin />
        </S.ClientListState>
      </S.ClientList>
    );
  }

  if (clientsListError) {
    return (
      <S.ClientList>
        <S.ClientListState>
          <Text type="danger">{clientsListError}</Text>
        </S.ClientListState>
      </S.ClientList>
    );
  }

  if (visibleClients.length === 0) {
    return (
      <S.ClientList>
        <S.ClientListState>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t("orders.create.client.empty")}
          />
        </S.ClientListState>
      </S.ClientList>
    );
  }

  return (
    <S.ClientList>
      <List
        dataSource={visibleClients}
        renderItem={(client) => (
          <ClientSearchListItem client={client} onSelect={onClientSelect} />
        )}
      />
    </S.ClientList>
  );
}
