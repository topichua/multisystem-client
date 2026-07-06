import { PlusIcon } from "@phosphor-icons/react";
import { Badge, Button, Card, Flex, Tag, Typography, theme } from "antd";
import { useTranslation } from "react-i18next";

import type {
  InitialStockValues,
  InventoryMovementsResponse,
  StockCorrectionValues,
  StockPurchaseValues,
} from "@/features/inventory/model/inventory.types";
import type {
  ProductInventoryVariant,
  ProductVariant,
} from "@/features/products/model/product.types";
import { formatProductPrice } from "@/features/products/utils/product-display";

import {
  formatNumber,
  getMarginPercent,
  getVariantDisplayName,
  getVariantQuantity,
} from "./product-inventory-drawer.utils";
import { ProductInventoryMovementsHistory } from "./product-inventory-movements-history/product-inventory-movements-history";

const { Text } = Typography;

type ProductInventoryVariantCardProps = {
  variant: ProductInventoryVariant;
  detailVariant: ProductVariant | undefined;
  currency: string;
  fallbackName: string;
  expanded: boolean;
  movements: InventoryMovementsResponse | null;
  movementsLoading: boolean;
  movementsError: string | null;
  initialStockSubmitting: boolean;
  initialStockError: string | null;
  stockMovementSubmitting: boolean;
  stockMovementError: string | null;
  onToggleExpanded: () => void;
  onRetryMovements: () => void;
  onCreateInitialStock: (values: InitialStockValues) => Promise<void>;
  onCreateStockPurchase: (values: StockPurchaseValues) => Promise<void>;
  onCreateStockCorrection: (values: StockCorrectionValues) => Promise<void>;
};

export const ProductInventoryVariantCard = ({
  variant,
  detailVariant,
  currency,
  fallbackName,
  expanded,
  movements,
  movementsLoading,
  movementsError,
  initialStockSubmitting,
  initialStockError,
  stockMovementSubmitting,
  stockMovementError,
  onToggleExpanded,
  onRetryMovements,
  onCreateInitialStock,
  onCreateStockPurchase,
  onCreateStockCorrection,
}: ProductInventoryVariantCardProps) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const quantity = getVariantQuantity(variant);
  const price = variant.price ?? detailVariant?.price ?? null;
  const purchasePrice = variant.averagePurchasePrice;
  const marginPercent = getMarginPercent(price, purchasePrice);
  const variantName = getVariantDisplayName(
    variant,
    detailVariant,
    fallbackName,
  );
  const sku = variant.sku || detailVariant?.sku || "—";

  return (
    <Card
      size="small"
      style={{
        background: expanded ? token.colorBgContainer : "rgb(242, 242, 242)",
        borderColor: expanded ? token.colorPrimary : token.colorBorderSecondary,
        transition: "background 0.2s ease, border-color 0.2s ease",
      }}
      styles={{
        body: {
          background: "transparent",
        },
      }}
    >
      <Flex vertical gap={12}>
        <Flex align="flex-start" justify="space-between" gap={16}>
          <Flex vertical gap={2} style={{ minWidth: 0 }}>
            <Text strong>{variantName}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {sku}
            </Text>
          </Flex>

          <Flex align="center" gap={12} style={{ flexShrink: 0 }}>
            <Flex align="center" gap={6}>
              <Badge status={quantity > 0 ? "success" : "error"} />
              <Text type={quantity === 0 ? "danger" : undefined} strong>
                {formatNumber(quantity)}
              </Text>
              <Text type={quantity === 0 ? "danger" : undefined} strong>
                {t("products.inventoryDrawer.unit")}
              </Text>
            </Flex>

            <Button
              icon={<PlusIcon size={16} />}
              aria-label={t(
                expanded
                  ? "products.inventoryDrawer.collapseHistoryAria"
                  : "products.inventoryDrawer.expandHistoryAria",
              )}
              style={{
                background: expanded
                  ? token.colorPrimaryBg
                  : token.colorBgContainer,
                borderColor: expanded ? token.colorPrimary : undefined,
                color: expanded ? token.colorPrimary : undefined,
                transform: expanded ? "rotate(45deg)" : undefined,
                transition:
                  "background 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.2s ease",
              }}
              onClick={onToggleExpanded}
            />
          </Flex>
        </Flex>

        <Flex gap={8} wrap="wrap">
          <Tag>
            <Text type="secondary">{t("products.inventoryDrawer.price")}</Text>{" "}
            <Text strong>{formatProductPrice(price, currency)}</Text>
          </Tag>
          <Tag>
            <Text type="secondary">
              {t("products.inventoryDrawer.purchasePrice")}
            </Text>{" "}
            <Text>
              {purchasePrice == null
                ? "—"
                : formatProductPrice(purchasePrice, currency)}
            </Text>
          </Tag>
          {marginPercent != null && (
            <Tag color={marginPercent >= 0 ? "success" : "error"}>
              {marginPercent > 0 ? "+" : ""}
              {marginPercent}%
            </Tag>
          )}
        </Flex>

        <ProductInventoryMovementsHistory
          expanded={expanded}
          variantId={variant.variantId}
          variantName={variantName}
          movements={movements}
          movementsLoading={movementsLoading}
          movementsError={movementsError}
          quantity={quantity}
          currency={currency}
          canInitializeStock={variant.stockInitialized === false}
          canCreateStockMovement={variant.stockInitialized === true}
          initialStockSubmitting={initialStockSubmitting}
          initialStockError={initialStockError}
          stockMovementSubmitting={stockMovementSubmitting}
          stockMovementError={stockMovementError}
          onRetryMovements={onRetryMovements}
          onCreateInitialStock={onCreateInitialStock}
          onCreateStockPurchase={onCreateStockPurchase}
          onCreateStockCorrection={onCreateStockCorrection}
        />
      </Flex>
    </Card>
  );
};
