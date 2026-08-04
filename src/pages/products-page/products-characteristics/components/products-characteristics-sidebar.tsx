import {
  CaretRightIcon,
  ListChecksIcon,
  PlusIcon,
  TextTIcon,
} from "@phosphor-icons/react";
import { Button, Empty, Flex, Input, Tag, Typography } from "antd";
import { useTranslation } from "react-i18next";

import {
  PaneScrollRegion,
  PaneSectionHeaderStack,
  PaneSectionTitle,
} from "@/components/layout/pane-frame";
import { PaneNavSplitLayout } from "@/components/layout/pane-nav-split-layout";
import type { Characteristic } from "@/features/characteristics/model/characteristic.types";

import * as S from "../products-characteristics-layout.styled";

const { Text } = Typography;

type ProductsCharacteristicsSidebarProps = {
  characteristics: Characteristic[];
  totalCount: number;
  activeCharacteristicId: number | null;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onCreateClick: () => void;
  onCharacteristicClick: (characteristicId: number) => void;
};

export const ProductsCharacteristicsSidebar = ({
  characteristics,
  totalCount,
  activeCharacteristicId,
  searchValue,
  onSearchChange,
  onCreateClick,
  onCharacteristicClick,
}: ProductsCharacteristicsSidebarProps) => {
  const { t } = useTranslation();
  const emptyDescription =
    totalCount === 0
      ? t("characteristics.emptyState")
      : t("characteristics.emptySearch");

  return (
    <PaneNavSplitLayout.SubSidebar data-qa="layout-products-characteristics-sidebar">
      <PaneSectionHeaderStack data-qa="layout-products-characteristics-header">
        <Flex align="center" justify="space-between" gap={12}>
          <div>
            <PaneSectionTitle>{t("characteristics.title")}</PaneSectionTitle>
            <Text type="secondary">
              {t("characteristics.itemsCount", { count: totalCount })}
            </Text>
          </div>

          <Button type="primary" icon={<PlusIcon />} onClick={onCreateClick}>
            {t("characteristics.createCharacteristic")}
          </Button>
        </Flex>

        <Input.Search
          allowClear
          placeholder={t("characteristics.searchPlaceholder")}
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </PaneSectionHeaderStack>

      <PaneScrollRegion data-qa="layout-products-characteristics-nav-scroll">
        <div data-qa="layout-products-characteristics-nav">
          {characteristics.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={emptyDescription}
            />
          ) : (
            characteristics.map((characteristic) => {
              const isActive = characteristic.id === activeCharacteristicId;
              const isArchived = characteristic.archivedAt != null;
              const optionsCount = characteristic.options?.length ?? 0;

              return (
                <S.CharacteristicNavItem
                  key={characteristic.id}
                  type="button"
                  $active={isActive}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => onCharacteristicClick(characteristic.id)}
                >
                  <Flex align="center" gap={12}>
                    <S.CharacteristicNavTypeBadge $active={isActive}>
                      {characteristic.type === "options" ? (
                        <ListChecksIcon size={20} />
                      ) : (
                        <TextTIcon size={20} />
                      )}
                    </S.CharacteristicNavTypeBadge>

                    <Flex vertical flex={1} style={{ minWidth: 0 }}>
                      <Flex align="center" gap={8} style={{ minWidth: 0 }}>
                        <Text
                          strong={!isArchived}
                          type={isArchived ? "secondary" : undefined}
                          ellipsis={{ tooltip: characteristic.label }}
                          style={{ minWidth: 0 }}
                        >
                          {characteristic.label}
                        </Text>

                        {isArchived && (
                          <Tag style={{ marginInlineEnd: 0, flexShrink: 0 }}>
                            {t("characteristics.archivedBadge")}
                          </Tag>
                        )}
                      </Flex>

                      <Text type="secondary">
                        {characteristic.type === "options"
                          ? t("characteristics.optionsCount", {
                              count: optionsCount,
                            })
                          : t("characteristics.typeText")}
                      </Text>
                    </Flex>

                    <CaretRightIcon size={16} />
                  </Flex>
                </S.CharacteristicNavItem>
              );
            })
          )}
        </div>
      </PaneScrollRegion>
    </PaneNavSplitLayout.SubSidebar>
  );
};
