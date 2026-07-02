import { Alert, Button, Empty, Flex, Spin, Typography, theme } from "antd";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import type { InventoryMovementsResponse } from "@/features/inventory/model/inventory.types";
import { useWorkspaceMembersStore } from "@/features/workspace-members/model/use-workspace-members-store";
import { getWorkspaceMemberName } from "@/features/workspace-members/utils/workspace-member-display";

import { ProductInventoryMovementHistoryItem } from "./product-inventory-movement-history-item";
import { buildMovementTransitions } from "./product-inventory-movements-history.utils";

const { Text } = Typography;

type ProductInventoryMovementsHistoryProps = {
  expanded: boolean;
  movements: InventoryMovementsResponse | null;
  movementsLoading: boolean;
  movementsError: string | null;
  quantity: number;
  currency: string;
  onRetryMovements: () => void;
};

export const ProductInventoryMovementsHistory = observer(
  ({
    expanded,
    movements,
    movementsLoading,
    movementsError,
    quantity,
    currency,
    onRetryMovements,
  }: ProductInventoryMovementsHistoryProps) => {
    const { t } = useTranslation();
    const { token } = theme.useToken();
    const workspaceMembersStore = useWorkspaceMembersStore();
    const movementItems = movements?.items;
    const movementTransitions = useMemo(
      () => buildMovementTransitions(movementItems ?? [], quantity),
      [movementItems, quantity],
    );
    const userNameByUserId = useMemo(
      () =>
        new Map(
          workspaceMembersStore.members.map((member) => [
            member.user.id,
            getWorkspaceMemberName(member),
          ]),
        ),
      [workspaceMembersStore.members],
    );

    useEffect(() => {
      if (
        expanded &&
        workspaceMembersStore.members.length === 0 &&
        !workspaceMembersStore.listLoading
      ) {
        void workspaceMembersStore.loadMembers();
      }
    }, [
      expanded,
      workspaceMembersStore,
      workspaceMembersStore.listLoading,
      workspaceMembersStore.members.length,
    ]);

    if (!expanded) {
      return null;
    }

    let content: ReactNode;

    if (movementsLoading) {
      content = (
        <Flex align="center" justify="center" style={{ minHeight: 72 }}>
          <Spin size="small" />
        </Flex>
      );
    } else if (movementsError) {
      content = (
        <Alert
          type="error"
          showIcon
          title={t("products.inventoryDrawer.movementsLoadError")}
          description={movementsError}
          action={
            <Button size="small" onClick={onRetryMovements}>
              {t("products.inventoryDrawer.retry")}
            </Button>
          }
        />
      );
    } else if (movementTransitions.length === 0) {
      content = (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t("products.inventoryDrawer.movementsEmpty")}
        />
      );
    } else {
      content = (
        <Flex vertical gap={10}>
          {movementTransitions.map(
            ({ movement, quantityBefore, quantityAfter }) => (
              <ProductInventoryMovementHistoryItem
                key={movement.id}
                movement={movement}
                quantityBefore={quantityBefore}
                quantityAfter={quantityAfter}
                currency={currency}
                userName={
                  movement.user
                    ? (userNameByUserId.get(movement.user.id) ??
                      movement.user.name ??
                      null)
                    : null
                }
              />
            ),
          )}
        </Flex>
      );
    }

    return (
      <Flex
        vertical
        gap={12}
        style={{
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          paddingTop: 12,
        }}
      >
        <Flex align="center" justify="space-between" gap={12}>
          <Text strong>{t("products.inventoryDrawer.historyTitle")}</Text>
          {movements && movements.total > movementTransitions.length ? (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {t("products.inventoryDrawer.historyLoadedCount", {
                count: movementTransitions.length,
                total: movements.total,
              })}
            </Text>
          ) : null}
        </Flex>

        {content}
      </Flex>
    );
  },
);
