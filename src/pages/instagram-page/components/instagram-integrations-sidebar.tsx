import type { MenuProps } from "antd";
import { Avatar, Empty, Flex, Menu, Spin, Typography } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { InstagramIntegration } from "@/features/instagram/model/instagram.types";

import {
  formatCompactNumber,
  formatHandle,
} from "../utils/instagram-page-format";
import * as S from "../instagram-page.styled";

const { Text } = Typography;

type InstagramIntegrationsSidebarProps = {
  integrations: InstagramIntegration[];
  loading: boolean;
  selectedKey?: string;
  onSelect: (key: string) => void;
};

export const InstagramIntegrationsSidebar = ({
  integrations,
  loading,
  selectedKey,
  onSelect,
}: InstagramIntegrationsSidebarProps) => {
  const { t } = useTranslation();

  const menuItems: MenuProps["items"] = useMemo(
    () => [
      {
        type: "group",
        key: "connected-accounts",
        label: (
          <Text
            type="secondary"
            style={{
              fontSize: 12,
              letterSpacing: 0.5,
              textTransform: "uppercase",
            }}
          >
            {t("instagram.connectedPages")}
          </Text>
        ),
        style: { padding: 0 },
        children: integrations.map((integration) => ({
          key: String(integration.integration_id),
          label: (
            <Flex align="center" gap={12}>
              <Avatar size={40} />

              <Flex vertical gap={0}>
                <Text strong>{formatHandle(integration.name)}</Text>

                {(integration.media_count != null ||
                  integration.followers_count != null) && (
                  <Flex gap={6} align="center">
                    {integration.media_count != null ? (
                      <Text type="secondary">
                        {formatCompactNumber(integration.media_count)}{" "}
                        {t("instagram.postsLabel")}
                      </Text>
                    ) : null}
                    {integration.media_count != null &&
                    integration.followers_count != null ? (
                      <Text>·</Text>
                    ) : null}
                    {integration.followers_count != null ? (
                      <Text type="secondary">
                        {formatCompactNumber(integration.followers_count)}{" "}
                        {t("instagram.followersLabel")}
                      </Text>
                    ) : null}
                  </Flex>
                )}
              </Flex>
            </Flex>
          ),
          style: {
            padding: "12px",
            height: "auto",
          },
        })),
      },
    ],
    [integrations, t],
  );

  if (loading) {
    return (
      <S.SidebarCenteredState>
        <Spin />
      </S.SidebarCenteredState>
    );
  }

  if (integrations.length === 0) {
    return (
      <S.SidebarCenteredState>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t("instagram.emptySidebar")}
        />
      </S.SidebarCenteredState>
    );
  }

  return (
    <Menu
      mode="inline"
      selectedKeys={selectedKey ? [selectedKey] : []}
      items={menuItems}
      onClick={({ key }) => onSelect(key)}
      style={{ borderInlineEnd: "none" }}
    />
  );
};
