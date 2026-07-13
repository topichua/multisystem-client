import { EyeIcon } from "@phosphor-icons/react";
import { Button, Card, Flex, Typography } from "antd";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

import type {
  InventoryHistoryItem,
  InventoryHistorySupplyItem,
} from "@/features/inventory/model/inventory.types";
import { formatNumber } from "@/features/products/components/product-inventory-drawer/product-inventory-drawer.utils";
import { formatQuantityChange } from "@/features/products/components/product-inventory-drawer/product-inventory-movements-history/product-inventory-movements-history.utils";
import type { WorkspaceMember } from "@/features/workspace-members/model/workspace-member.types";
import { useWorkspaceSettingsStore } from "@/features/workspace-settings/model/use-workspace-settings-store";

import { InventoryHistoryUserCell } from "./inventory-history-user-cell";
import * as S from "./inventory-history-table-cells.styled";
import {
  formatInventoryHistoryDate,
  formatInventoryHistoryTime,
  getInventoryHistoryBadgeLabel,
  getInventoryHistoryBadgeTone,
  getInventoryHistoryItemDetails,
  getInventoryHistoryMovementNote,
  getInventoryHistoryPriceLabel,
  getInventoryHistoryQuantityChange,
  getInventoryHistoryStockLabel,
  isInventoryHistorySupplyItem,
} from "./products-inventory-history.utils";

const { Text } = Typography;

const MobileCard = styled(Card)`
  && {
    border-radius: 12px;
  }
`;

type InventoryHistoryMobileCardProps = {
  item: InventoryHistoryItem;
  memberByUserId: Map<number, WorkspaceMember>;
  onOpenSupply?: (item: InventoryHistorySupplyItem) => void;
};

export const InventoryHistoryMobileCard = ({
  item,
  memberByUserId,
  onOpenSupply,
}: InventoryHistoryMobileCardProps) => {
  const { t } = useTranslation();
  const workspaceSettingsStore = useWorkspaceSettingsStore();
  const currency = workspaceSettingsStore.currency ?? "UAH";
  const { title, subtitle, isSupply } = getInventoryHistoryItemDetails(item, t);
  const movementNote = getInventoryHistoryMovementNote(item);
  const quantityChange = getInventoryHistoryQuantityChange(item);

  return (
    <MobileCard
      data-qa={`products-mobile-inventory-history-item-${item.kind}-${item.id}`}
    >
      <Flex vertical gap={10}>
        <Flex justify="space-between" align="flex-start" gap={8}>
          <Flex vertical gap={2} style={{ minWidth: 0 }}>
            <Text strong>{title}</Text>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {subtitle}
            </Text>
          </Flex>
          <Text type="secondary" style={{ fontSize: 12, whiteSpace: "nowrap" }}>
            {formatInventoryHistoryDate(item.createdAt)}
            <br />
            {formatInventoryHistoryTime(item.createdAt)}
          </Text>
        </Flex>

        {movementNote ? (
          <Text type="secondary" italic style={{ fontSize: 13 }}>
            {movementNote}
          </Text>
        ) : null}

        <Flex align="center" justify="space-between" gap={8} wrap="wrap">
          <S.TypeBadge $compact $tone={getInventoryHistoryBadgeTone(item.type)}>
            {getInventoryHistoryBadgeLabel(item.type, t)}
          </S.TypeBadge>
          <S.ChangeText $positive={quantityChange >= 0}>
            {formatQuantityChange(quantityChange)}
          </S.ChangeText>
        </Flex>

        <Flex justify="space-between" align="center" gap={8} wrap="wrap">
          <Text>{getInventoryHistoryStockLabel(item, t, formatNumber)}</Text>
          <Text>{getInventoryHistoryPriceLabel(item, currency, t)}</Text>
        </Flex>

        <InventoryHistoryUserCell
          user={item.user}
          memberByUserId={memberByUserId}
          avatarSize={24}
        />

        {isSupply && onOpenSupply && isInventoryHistorySupplyItem(item) ? (
          <Button
            type="link"
            icon={<EyeIcon size={16} />}
            style={{ alignSelf: "flex-start", padding: 0, height: "auto" }}
            onClick={() => onOpenSupply(item)}
          >
            {t("products.inventoryHistory.viewDetails")}
          </Button>
        ) : null}
      </Flex>
    </MobileCard>
  );
};
