import { MagnifyingGlassIcon, SquaresFourIcon } from "@phosphor-icons/react";
import type { MenuProps } from "antd";
import { Badge, Flex, Input, Menu, Typography } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { PaneScrollRegion } from "@/components/layout/pane-frame";
import { InstagramLogoIcon } from "@/components/icons/instagram/instagram-logo-icon";
import { TelegramLogoIcon } from "@/components/icons/telegram/telegram-logo-icon";

import type {
  IntegrationDefinition,
  IntegrationFilter,
  IntegrationType,
} from "./settings-integrations.definitions";

const SIDEBAR_ICON_SIZE = 24;

const getSidebarIcon = (type: IntegrationType) => {
  switch (type) {
    case "instagram":
      return <InstagramLogoIcon size={SIDEBAR_ICON_SIZE} />;
    case "telegram":
      return <TelegramLogoIcon size={SIDEBAR_ICON_SIZE} />;
  }
};

type IntegrationTypeSidebarProps = {
  integrationsCountByType: Record<IntegrationType, number>;
  menuIntegrationTypes: readonly IntegrationDefinition[];
  query: string;
  selectedFilter: IntegrationFilter;
  totalCount: number;
  onQueryChange: (query: string) => void;
  onFilterChange: (filter: IntegrationFilter) => void;
};

export function IntegrationTypeSidebar({
  integrationsCountByType,
  menuIntegrationTypes,
  query,
  selectedFilter,
  totalCount,
  onQueryChange,
  onFilterChange,
}: IntegrationTypeSidebarProps) {
  const { t } = useTranslation();

  const menuItems: MenuProps["items"] = useMemo(() => {
    const typeItems = menuIntegrationTypes.map((item) => ({
      key: item.type,
      icon: getSidebarIcon(item.type),
      label: (
        <Flex align="center" justify="space-between" gap={12}>
          <Typography.Text>{t(item.labelKey)}</Typography.Text>
          <Badge count={integrationsCountByType[item.type]} showZero />
        </Flex>
      ),
    }));

    return [
      {
        key: "all",
        icon: <SquaresFourIcon size={SIDEBAR_ICON_SIZE} />,
        label: (
          <Flex align="center" justify="space-between" gap={12}>
            <Typography.Text>
              {t("integrations.allIntegrations")}
            </Typography.Text>
            <Badge count={totalCount} showZero />
          </Flex>
        ),
      },
      ...typeItems,
    ];
  }, [integrationsCountByType, menuIntegrationTypes, totalCount, t]);

  return (
    <>
      <div style={{ flexShrink: 0, marginBottom: 12 }}>
        <Input
          placeholder={t("integrations.searchPlaceholder")}
          prefix={<MagnifyingGlassIcon />}
          value={query}
          allowClear
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </div>

      <PaneScrollRegion data-qa="layout-settings-integrations-nav-scroll">
        <Menu
          mode="inline"
          selectable
          selectedKeys={[selectedFilter]}
          items={menuItems}
          onClick={({ key }) => onFilterChange(key as IntegrationFilter)}
          style={{ borderInlineEnd: 0 }}
        />
      </PaneScrollRegion>
    </>
  );
}
