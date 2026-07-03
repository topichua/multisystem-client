import { Flex, Typography } from "antd";
import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";

import type { InventoryMovement } from "@/features/inventory/model/inventory.types";
import { formatProductPrice } from "@/features/products/utils/product-display";
import { formatDateTime } from "@/utils/date-time";

import { formatNumber } from "../product-inventory-drawer.utils";
import {
  formatQuantityChange,
  getMovementTitle,
} from "./product-inventory-movements-history.utils";
import { Tag } from "@/components/tag/tag";

const { Text } = Typography;

const secondaryTextStyle: CSSProperties = { fontSize: 12 };

type ProductInventoryMovementHistoryItemProps = {
  movement: InventoryMovement;
  quantityBefore: number;
  quantityAfter: number;
  currency: string;
  userName: string | null;
};

export const ProductInventoryMovementHistoryItem = ({
  movement,
  quantityBefore,
  quantityAfter,
  currency,
  userName,
}: ProductInventoryMovementHistoryItemProps) => {
  const { t } = useTranslation();

  return (
    <Flex align="flex-start" gap={12}>
      <Tag
        color={movement.quantityChange >= 0 ? "success" : "error"}
        style={{
          margin: 0,
          minWidth: 46,
          textAlign: "center",
        }}
      >
        {formatQuantityChange(movement.quantityChange)}
      </Tag>

      <Flex vertical gap={4} style={{ flex: 1, minWidth: 0 }}>
        <Flex align="flex-start" justify="space-between" gap={8} wrap="wrap">
          <Flex vertical gap={2} style={{ minWidth: 0, flex: "1 1 160px" }}>
            <Text strong>{getMovementTitle(movement.type, t)}</Text>
            {movement.reason && (
              <Text type="secondary" style={secondaryTextStyle}>
                {movement.reason}
              </Text>
            )}
          </Flex>
          <Text type="secondary" style={secondaryTextStyle}>
            {formatDateTime(movement.createdAt)}
          </Text>
        </Flex>

        <Flex align="center" gap={8} wrap="wrap">
          {movement.purchasePrice != null && (
            <Text type="secondary" style={secondaryTextStyle}>
              {t("products.inventoryDrawer.purchasePricePerUnit", {
                price: formatProductPrice(movement.purchasePrice, currency),
              })}
            </Text>
          )}

          <Text type="secondary" style={secondaryTextStyle}>
            {t("products.inventoryDrawer.quantityTransition", {
              before: formatNumber(quantityBefore),
              after: formatNumber(quantityAfter),
              unit: t("products.inventoryDrawer.unit"),
            })}
          </Text>

          {userName && (
            <>
              <Text type="secondary" style={secondaryTextStyle}>
                ·
              </Text>
              <Text type="secondary" style={secondaryTextStyle}>
                {userName}
              </Text>
            </>
          )}
        </Flex>

        {movement.comment && (
          <Text type="secondary" style={secondaryTextStyle}>
            {movement.comment}
          </Text>
        )}
      </Flex>
    </Flex>
  );
};
