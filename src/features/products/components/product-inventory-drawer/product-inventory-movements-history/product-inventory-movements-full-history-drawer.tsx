import { Alert, Button, Drawer, Empty, Flex, Spin, Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { INVENTORY_MOVEMENTS_DEFAULT_LIMIT } from "@/features/inventory/model/inventory.types";
import { useInventoryStore } from "@/features/inventory/model/use-inventory-store";
import { useWorkspaceMembersStore } from "@/features/workspace-members/model/use-workspace-members-store";
import { getWorkspaceMemberName } from "@/features/workspace-members/utils/workspace-member-display";

import { ProductInventoryMovementsList } from "./product-inventory-movements-list";
import {
  buildMovementTransitions,
  getDisplayableInventoryMovements,
  getDisplayableInventoryMovementsTotal,
} from "./product-inventory-movements-history.utils";
import { getInventoryDrawerLayoutProps } from "../product-inventory-drawer-layout";
import { useIsMobileViewport } from "@/utils/use-media-query";

const { Text } = Typography;

type ProductInventoryMovementsFullHistoryDrawerProps = {
  open: boolean;
  variantId: number;
  variantName: string;
  quantity: number;
  currency: string;
  onClose: () => void;
};

export const ProductInventoryMovementsFullHistoryDrawer = observer(
  ({
    open,
    variantId,
    variantName,
    quantity,
    currency,
    onClose,
  }: ProductInventoryMovementsFullHistoryDrawerProps) => {
    const { t } = useTranslation();
    const isMobileViewport = useIsMobileViewport();
    const drawerLayout = getInventoryDrawerLayoutProps({
      isMobile: isMobileViewport,
      desktopSize: 480,
    });
    const inventoryStore = useInventoryStore();
    const workspaceMembersStore = useWorkspaceMembersStore();
    const movements = inventoryStore.getVariantMovements(variantId);
    const movementsLoading =
      inventoryStore.isVariantMovementsLoading(variantId);
    const movementsError = inventoryStore.getVariantMovementsError(variantId);
    const movementItems = movements?.items;
    const displayableMovements = useMemo(
      () => getDisplayableInventoryMovements(movementItems ?? []),
      [movementItems],
    );
    const movementTransitions = useMemo(
      () => buildMovementTransitions(displayableMovements, quantity),
      [displayableMovements, quantity],
    );
    const displayableMovementsTotal = useMemo(
      () =>
        getDisplayableInventoryMovementsTotal(
          movementItems ?? [],
          movements?.total,
        ),
      [movementItems, movements?.total],
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
      if (!open) {
        return;
      }

      if (
        workspaceMembersStore.members.length === 0 &&
        !workspaceMembersStore.listLoading
      ) {
        void workspaceMembersStore.loadMembers();
      }

      void inventoryStore
        .loadVariantMovements(variantId, {
          limit: INVENTORY_MOVEMENTS_DEFAULT_LIMIT,
          force: true,
        })
        .catch(() => undefined);
    }, [inventoryStore, open, variantId, workspaceMembersStore]);

    return (
      <Drawer
        open={open}
        title={t("products.inventoryDrawer.fullHistoryTitle", {
          variantName,
        })}
        {...drawerLayout}
        destroyOnHidden
        onClose={onClose}
        closable={{ placement: "end" }}
      >
        {movementsLoading ? (
          <Flex align="center" justify="center" style={{ minHeight: 160 }}>
            <Spin />
          </Flex>
        ) : movementsError ? (
          <Alert
            type="error"
            showIcon
            title={t("products.inventoryDrawer.movementsLoadError")}
            description={movementsError}
            action={
              <Button
                size="small"
                onClick={() => {
                  void inventoryStore
                    .loadVariantMovements(variantId, {
                      limit: INVENTORY_MOVEMENTS_DEFAULT_LIMIT,
                      force: true,
                    })
                    .catch(() => undefined);
                }}
              >
                {t("products.inventoryDrawer.retry")}
              </Button>
            }
          />
        ) : movementTransitions.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t("products.inventoryDrawer.movementsNoChangesYet")}
          />
        ) : (
          <Flex vertical gap={12}>
            {movements &&
              displayableMovementsTotal > displayableMovements.length && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {t("products.inventoryDrawer.historyLoadedCount", {
                    count: displayableMovements.length,
                    total: displayableMovementsTotal,
                  })}
                </Text>
              )}
            <ProductInventoryMovementsList
              movementTransitions={movementTransitions}
              currency={currency}
              userNameByUserId={userNameByUserId}
            />
          </Flex>
        )}
      </Drawer>
    );
  },
);
