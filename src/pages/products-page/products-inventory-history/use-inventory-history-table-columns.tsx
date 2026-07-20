import { EyeIcon } from "@phosphor-icons/react";
import type { TableColumnsType } from "antd";
import { Button, Typography } from "antd";
import { useMemo } from "react";
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

type UseInventoryHistoryTableColumnsParams = {
  members: WorkspaceMember[];
  onOpenSupply?: (item: InventoryHistorySupplyItem) => void;
};

export function useInventoryHistoryTableColumns({
  members,
  onOpenSupply,
}: UseInventoryHistoryTableColumnsParams): TableColumnsType<InventoryHistoryItem> {
  const { t } = useTranslation();
  const workspaceSettingsStore = useWorkspaceSettingsStore();
  const currency = workspaceSettingsStore.currency ?? "UAH";

  const memberByUserId = useMemo(
    () => new Map(members.map((member) => [member.user.id, member])),
    [members],
  );

  return useMemo(
    () => [
      {
        title: t("products.inventoryHistory.table.date"),
        dataIndex: "createdAt",
        key: "createdAt",
        width: 120,
        render: (value: string) => (
          <S.DateCell>
            <S.DateText>{formatInventoryHistoryDate(value)}</S.DateText>
            <Text type="secondary">{formatInventoryHistoryTime(value)}</Text>
          </S.DateCell>
        ),
      },
      {
        title: t("products.inventoryHistory.table.details"),
        key: "details",
        ellipsis: true,
        render: (_, item) => {
          const { title, subtitle, isSupply } = getInventoryHistoryItemDetails(
            item,
            t,
          );
          const movementNote = getInventoryHistoryMovementNote(item);

          return (
            <S.DetailsCell>
              <S.ItemTitle>{title}</S.ItemTitle>

              <Text type="secondary">{subtitle}</Text>

              {movementNote && (
                <Text type="secondary" italic>
                  {movementNote}
                </Text>
              )}

              {isSupply &&
              onOpenSupply &&
              isInventoryHistorySupplyItem(item) && (
                <Button
                  type="link"
                  icon={<EyeIcon size={16} />}
                  data-qa={`products-inventory-history-view-${item.id}`}
                  style={{
                    alignSelf: "flex-start",
                    padding: 0,
                    height: "auto",
                  }}
                  onClick={() => onOpenSupply(item)}
                >
                  {t("products.inventoryHistory.viewDetails")}
                </Button>
              )}
            </S.DetailsCell>
          );
        },
      },
      {
        title: t("products.inventoryHistory.table.type"),
        dataIndex: "type",
        key: "type",
        width: 180,
        render: (type: InventoryHistoryItem["type"]) => (
          <S.TypeBadge $tone={getInventoryHistoryBadgeTone(type)}>
            {getInventoryHistoryBadgeLabel(type, t)}
          </S.TypeBadge>
        ),
      },
      {
        title: t("products.inventoryHistory.table.change"),
        key: "change",
        width: 90,
        render: (_, item) => {
          const quantityChange = getInventoryHistoryQuantityChange(item);

          return (
            <S.ChangeText $positive={quantityChange >= 0}>
              {formatQuantityChange(quantityChange)}
            </S.ChangeText>
          );
        },
      },
      {
        title: t("products.inventoryHistory.table.stock"),
        key: "stock",
        width: 120,
        render: (_, item) => {
          if (isInventoryHistorySupplyItem(item)) {
            return (
              <Text>
                {getInventoryHistoryStockLabel(item, t, formatNumber)}
              </Text>
            );
          }

          return (
            <>
              <Text type="secondary">{formatNumber(item.stockBefore)}</Text> →{" "}
              <Text strong>{formatNumber(item.stockAfter)}</Text>
            </>
          );
        },
      },
      {
        title: t("products.inventoryHistory.table.price"),
        key: "price",
        width: 110,
        render: (_, item) => (
          <Text>{getInventoryHistoryPriceLabel(item, currency, t)}</Text>
        ),
      },
      {
        title: t("products.inventoryHistory.table.user"),
        key: "user",
        width: 180,
        ellipsis: true,
        render: (_, item) => (
          <InventoryHistoryUserCell
            user={item.user}
            memberByUserId={memberByUserId}
          />
        ),
      },
    ],
    [currency, memberByUserId, onOpenSupply, t],
  );
}
