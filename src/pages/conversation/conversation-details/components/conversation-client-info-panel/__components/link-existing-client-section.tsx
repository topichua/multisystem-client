import { LinkSimpleIcon } from "@phosphor-icons/react";
import { Button, Empty, Flex, Input, List, Spin, Typography } from "antd";
import { useTranslation } from "react-i18next";

import type { Client } from "@/features/clients/model/client.types";
import { ClientSearchListItem } from "@/pages/orders-page/orders-new/components/orders-new-client-section/client-search-list-item";
import { SelectedClientCard } from "@/pages/orders-page/orders-new/components/orders-new-client-section/selected-client-card";

import * as S from "../conversation-client-info-panel.styled";

const { Text } = Typography;

type LinkExistingClientSectionProps = {
  linkSectionOpen: boolean;
  linkLoading: boolean;
  searchValue: string;
  searchLoading: boolean;
  searchRequested: boolean;
  searchError: string | null;
  searchResults: Client[];
  selectedClient: Client | null;
  onOpenLinkSection: () => void;
  onCloseLinkSection: () => void;
  onSearchChange: (value: string) => void;
  onClientSelect: (client: Client) => void;
  onClearSelectedClient: () => void;
  onLinkClient: () => Promise<boolean>;
};

export function LinkExistingClientSection({
  linkSectionOpen,
  linkLoading,
  searchValue,
  searchLoading,
  searchRequested,
  searchError,
  searchResults,
  selectedClient,
  onOpenLinkSection,
  onCloseLinkSection,
  onSearchChange,
  onClientSelect,
  onClearSelectedClient,
  onLinkClient,
}: LinkExistingClientSectionProps) {
  const { t } = useTranslation();

  if (!linkSectionOpen) {
    return (
      <S.LinkExistingClientButton
        block
        htmlType="button"
        icon={<LinkSimpleIcon />}
        onClick={onOpenLinkSection}
      >
        {t("conversation.linkExistingClient")}
      </S.LinkExistingClientButton>
    );
  }

  return (
    <S.LinkExistingSection>
      <Flex justify="space-between" align="center">
        <Text strong>{t("conversation.linkExistingClientTitle")}</Text>
        <Button type="link" size="small" onClick={onCloseLinkSection}>
          {t("conversation.linkExistingClientBack")}
        </Button>
      </Flex>

      {selectedClient ? (
        <>
          <SelectedClientCard
            client={selectedClient}
            onClear={onClearSelectedClient}
          />
          <Button
            type="primary"
            block
            htmlType="button"
            loading={linkLoading}
            onClick={() => void onLinkClient()}
          >
            {t("conversation.linkExistingClientConfirm")}
          </Button>
        </>
      ) : (
        <>
          <Input
            value={searchValue}
            placeholder={t("conversation.linkExistingClientSearchPlaceholder")}
            autoComplete="off"
            onChange={(event) => onSearchChange(event.target.value)}
          />

          {searchRequested ? (
            searchLoading ? (
              <S.LinkExistingClientState>
                <Spin />
              </S.LinkExistingClientState>
            ) : searchError ? (
              <S.LinkExistingClientState>
                <Text type="danger">
                  {t("conversation.linkExistingClientSearchFailed")}
                </Text>
              </S.LinkExistingClientState>
            ) : searchResults.length === 0 ? (
              <S.LinkExistingClientState>
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={t("conversation.linkExistingClientNoResults")}
                />
              </S.LinkExistingClientState>
            ) : (
              <S.LinkExistingClientList>
                <List
                  dataSource={searchResults}
                  renderItem={(client) => (
                    <ClientSearchListItem
                      client={client}
                      onSelect={onClientSelect}
                    />
                  )}
                />
              </S.LinkExistingClientList>
            )
          ) : (
            <Text type="secondary">
              {t("conversation.linkExistingClientSearchHint")}
            </Text>
          )}
        </>
      )}
    </S.LinkExistingSection>
  );
}
