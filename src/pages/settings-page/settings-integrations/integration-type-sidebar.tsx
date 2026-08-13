import {
  CreditCardIcon,
  MagnifyingGlassIcon,
  SquaresFourIcon,
  TiktokLogoIcon,
} from "@phosphor-icons/react";
import type { MenuProps } from "antd";
import { Badge, Flex, Input, Menu, Typography } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import {
  PaneScrollRegion,
  PaneSectionHeaderStack,
  PaneSectionTitle,
} from "@/components/layout/pane-frame";
import { PaneNavSplitLayout } from "@/components/layout/pane-nav-split-layout";
import { InstagramLogoIcon } from "@/components/icons/instagram/instagram-logo-icon";
import { NovaPostIcon } from "@/components/icons/nova-post/nova-post-icon";
import { TelegramLogoIcon } from "@/components/icons/telegram/telegram-logo-icon";

import { INTEGRATION_TYPE_GROUPS } from "./settings-integrations.definitions";
import type {
  IntegrationDefinition,
  IntegrationFilter,
  IntegrationType,
} from "./settings-integrations.definitions";
import * as S from "./settings-integrations.styled";

const SIDEBAR_ICON_SIZE = 24;

const getSidebarIcon = (type: IntegrationType) => {
  switch (type) {
    case "instagram":
      return <InstagramLogoIcon size={SIDEBAR_ICON_SIZE} />;
    case "tiktok":
      return <TiktokLogoIcon size={SIDEBAR_ICON_SIZE} weight="fill" />;
    case "telegram":
      return <TelegramLogoIcon size={SIDEBAR_ICON_SIZE} />;
    case "novaposhta":
      return <NovaPostIcon size={SIDEBAR_ICON_SIZE} />;
    case "monobank":
      return <CreditCardIcon size={SIDEBAR_ICON_SIZE} weight="duotone" />;
    case "manualpayment":
      return <CreditCardIcon size={SIDEBAR_ICON_SIZE} weight="duotone" />;
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

export const IntegrationTypeSidebar = ({
  integrationsCountByType,
  menuIntegrationTypes,
  query,
  selectedFilter,
  totalCount,
  onQueryChange,
  onFilterChange,
}: IntegrationTypeSidebarProps) => {
  const { t } = useTranslation();

  const menuItems: MenuProps["items"] = useMemo(() => {
    const renderTypeItem = (item: IntegrationDefinition) => ({
      key: item.type,
      icon: getSidebarIcon(item.type),
      label: (
        <Flex align="center" justify="space-between" gap={12}>
          <Typography.Text>{t(item.labelKey)}</Typography.Text>
          <Badge count={integrationsCountByType[item.type]} showZero />
        </Flex>
      ),
    });

    const groupItems = INTEGRATION_TYPE_GROUPS.map((group) => {
      const children = menuIntegrationTypes
        .filter((item) => item.groupKey === group.key)
        .map(renderTypeItem);

      if (children.length === 0) {
        return null;
      }

      return {
        key: `group-${group.key}`,
        type: "group" as const,
        label: (
          <S.IntegrationSidebarGroupLabel>
            {t(group.labelKey)}
          </S.IntegrationSidebarGroupLabel>
        ),
        children,
      };
    }).filter((item): item is NonNullable<typeof item> => item !== null);

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
      ...groupItems,
    ];
  }, [integrationsCountByType, menuIntegrationTypes, totalCount, t]);

  return (
    <PaneNavSplitLayout.SubSidebar data-qa="layout-settings-integrations-sidebar">
      <PaneSectionHeaderStack data-qa="layout-settings-integrations-header">
        <PaneSectionTitle>{t("integrations.title")}</PaneSectionTitle>
        <Input
          placeholder={t("integrations.searchPlaceholder")}
          prefix={<MagnifyingGlassIcon />}
          value={query}
          allowClear
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </PaneSectionHeaderStack>

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
    </PaneNavSplitLayout.SubSidebar>
  );
};
