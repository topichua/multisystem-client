import { PlusIcon } from "@phosphor-icons/react";
import { Alert, Button, Empty, Flex, Spin, Typography, theme } from "antd";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import type {
  InitialStockValues,
  InventoryMovementsResponse,
  StockCorrectionValues,
  StockPurchaseValues,
} from "@/features/inventory/model/inventory.types";
import { INVENTORY_MOVEMENTS_PREVIEW_LIMIT } from "@/features/inventory/model/inventory.types";
import { useWorkspaceMembersStore } from "@/features/workspace-members/model/use-workspace-members-store";
import { getWorkspaceMemberName } from "@/features/workspace-members/utils/workspace-member-display";

import { ProductInventoryInitialStockForm } from "../product-inventory-initial-stock-form";
import { ProductInventoryStockMovementForm } from "../product-inventory-stock-movement-form";
import { ProductInventoryMovementsFullHistoryDrawer } from "./product-inventory-movements-full-history-drawer";
import { ProductInventoryMovementsList } from "./product-inventory-movements-list";
import {
  buildMovementTransitions,
  getDisplayableInventoryMovements,
  getDisplayableInventoryMovementsTotal,
} from "./product-inventory-movements-history.utils";

const { Text } = Typography;

type StockActionFormKind = "initial" | "movement";

type ProductInventoryMovementsHistoryProps = {
  expanded: boolean;
  variantId: number;
  variantName: string;
  movements: InventoryMovementsResponse | null;
  movementsLoading: boolean;
  movementsError: string | null;
  quantity: number;
  currency: string;
  canInitializeStock: boolean;
  canCreateStockMovement: boolean;
  initialStockSubmitting: boolean;
  initialStockError: string | null;
  stockMovementSubmitting: boolean;
  stockMovementError: string | null;
  onRetryMovements: () => void;
  onCreateInitialStock: (values: InitialStockValues) => Promise<void>;
  onCreateStockPurchase: (values: StockPurchaseValues) => Promise<void>;
  onCreateStockCorrection: (values: StockCorrectionValues) => Promise<void>;
};

export const ProductInventoryMovementsHistory = observer(
  ({
    expanded,
    variantId,
    variantName,
    movements,
    movementsLoading,
    movementsError,
    quantity,
    currency,
    canInitializeStock,
    canCreateStockMovement,
    initialStockSubmitting,
    initialStockError,
    stockMovementSubmitting,
    stockMovementError,
    onRetryMovements,
    onCreateInitialStock,
    onCreateStockPurchase,
    onCreateStockCorrection,
  }: ProductInventoryMovementsHistoryProps) => {
    const { t } = useTranslation();
    const { token } = theme.useToken();
    const workspaceMembersStore = useWorkspaceMembersStore();
    const [stockActionFormVisible, setStockActionFormVisible] = useState(false);
    const [fullHistoryOpen, setFullHistoryOpen] = useState(false);
    const movementItems = movements?.items;
    const displayableMovements = useMemo(
      () => getDisplayableInventoryMovements(movementItems ?? []),
      [movementItems],
    );
    const stockActionFormKind: StockActionFormKind | null = canInitializeStock
      ? "initial"
      : canCreateStockMovement
        ? "movement"
        : null;
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
    const previewTransitions = useMemo(
      () => movementTransitions.slice(0, INVENTORY_MOVEMENTS_PREVIEW_LIMIT),
      [movementTransitions],
    );
    const hasMoreHistory =
      displayableMovementsTotal > INVENTORY_MOVEMENTS_PREVIEW_LIMIT;
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

    useEffect(() => {
      if (!expanded || !stockActionFormKind) {
        setStockActionFormVisible(false);
      }
    }, [expanded, stockActionFormKind]);

    useEffect(() => {
      if (!expanded) {
        setFullHistoryOpen(false);
      }
    }, [expanded]);

    if (!expanded) {
      return null;
    }

    const handleCreateInitialStock = async (values: InitialStockValues) => {
      await onCreateInitialStock(values);
      setStockActionFormVisible(false);
    };

    const handleCreateStockPurchase = async (values: StockPurchaseValues) => {
      await onCreateStockPurchase(values);
      setStockActionFormVisible(false);
    };

    const handleCreateStockCorrection = async (
      values: StockCorrectionValues,
    ) => {
      await onCreateStockCorrection(values);
      setStockActionFormVisible(false);
    };

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
          description={t("products.inventoryDrawer.movementsNoChangesYet")}
        />
      );
    } else {
      content = (
        <Flex vertical gap={10}>
          <ProductInventoryMovementsList
            movementTransitions={previewTransitions}
            currency={currency}
            userNameByUserId={userNameByUserId}
          />
          {hasMoreHistory && (
            <Button type="link" block onClick={() => setFullHistoryOpen(true)}>
              {t("products.inventoryDrawer.showFullHistory")}
            </Button>
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
        <Flex align="center" justify="space-between" gap={12} wrap="wrap">
          <Text strong>{t("products.inventoryDrawer.historyTitle")}</Text>
          <Flex align="center" justify="flex-end" gap={8} wrap="wrap">
            {stockActionFormKind && !stockActionFormVisible && (
              <Button
                type="primary"
                size="small"
                icon={<PlusIcon size={14} />}
                onClick={() => setStockActionFormVisible(true)}
              >
                {t(
                  stockActionFormKind === "initial"
                    ? "products.inventoryDrawer.initialStock.cta"
                    : "products.inventoryDrawer.stockMovement.cta",
                )}
              </Button>
            )}
          </Flex>
        </Flex>

        {stockActionFormVisible && stockActionFormKind === "initial" && (
          <ProductInventoryInitialStockForm
            currency={currency}
            submitting={initialStockSubmitting}
            error={initialStockError}
            onCancel={() => setStockActionFormVisible(false)}
            onSubmit={handleCreateInitialStock}
          />
        )}

        {stockActionFormVisible && stockActionFormKind === "movement" && (
          <ProductInventoryStockMovementForm
            currency={currency}
            submitting={stockMovementSubmitting}
            error={stockMovementError}
            onCancel={() => setStockActionFormVisible(false)}
            onCreatePurchase={handleCreateStockPurchase}
            onCreateCorrection={handleCreateStockCorrection}
          />
        )}

        {content}

        <ProductInventoryMovementsFullHistoryDrawer
          open={fullHistoryOpen}
          variantId={variantId}
          variantName={variantName}
          quantity={quantity}
          currency={currency}
          onClose={() => setFullHistoryOpen(false)}
        />
      </Flex>
    );
  },
);
