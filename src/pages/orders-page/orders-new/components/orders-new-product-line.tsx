import {
  MinusIcon,
  PlusIcon,
  TagIcon,
  TrashIcon,
  XIcon,
} from "@phosphor-icons/react";
import { Button, Flex, InputNumber, Space, Typography } from "antd";
import { useTranslation } from "react-i18next";

import {
  formatCatalogVariantCurrency,
  getCatalogVariantMeta,
  getCatalogVariantUnitPrice,
} from "@/features/products/utils/catalog-variant-display";

import * as S from "../orders-new-page.styled";
import type { OrderNewLine } from "../orders-new.types";
import { formatProductAmount } from "../orders-new.utils.tsx";
import { VariantImage } from "./variant-image";

const { Text } = Typography;

type OrdersNewProductLineProps = {
  line: OrderNewLine;
  onDiscountChange: (variantId: number, value: number | null) => void;
  onQuantityChange: (variantId: number, quantity: number) => void;
  onRemove: (variantId: number) => void;
  onToggleDiscount: (variantId: number) => void;
};

export function OrdersNewProductLine({
  line,
  onDiscountChange,
  onQuantityChange,
  onRemove,
  onToggleDiscount,
}: OrdersNewProductLineProps) {
  const { t } = useTranslation();
  const meta = getCatalogVariantMeta(line.variant);
  const unitPrice = getCatalogVariantUnitPrice(line.variant);
  const currency = formatCatalogVariantCurrency(line.variant.product.currency);
  const maxQuantity = line.variant.quantity > 0 ? line.variant.quantity : null;
  const canDecrease = line.quantity > 1;
  const canIncrease = maxQuantity == null || line.quantity < maxQuantity;
  const lineTotal = unitPrice * line.quantity;
  const discountedTotal =
    line.discountPercent > 0
      ? lineTotal * (1 - line.discountPercent / 100)
      : lineTotal;

  return (
    <S.ProductLineBlock>
      <S.ProductLine>
        <VariantImage variant={line.variant} />
        <Flex vertical style={{ minWidth: 0 }}>
          <Text strong ellipsis>
            {line.variant.product.name}
          </Text>
          {meta ? (
            <Text type="secondary" ellipsis>
              {line.variant.sku ? `${line.variant.sku} · ` : null}
              {meta}
            </Text>
          ) : line.variant.sku ? (
            <Text type="secondary" ellipsis>
              {line.variant.sku}
            </Text>
          ) : null}
        </Flex>

        <Space.Compact>
          <Button
            size="small"
            icon={<MinusIcon size={14} />}
            disabled={!canDecrease}
            aria-label={t("orders.create.products.decreaseQuantity")}
            onClick={() => onQuantityChange(line.variantId, line.quantity - 1)}
          />
          <Button size="small" disabled style={{ width: 34 }}>
            {line.quantity}
          </Button>
          <Button
            size="small"
            icon={<PlusIcon size={14} />}
            disabled={!canIncrease}
            aria-label={t("orders.create.products.increaseQuantity")}
            onClick={() => onQuantityChange(line.variantId, line.quantity + 1)}
          />
        </Space.Compact>

        <Flex vertical align="flex-end">
          {line.discountPercent > 0 && (
            <Text delete type="secondary">
              {formatProductAmount(lineTotal, currency)}
            </Text>
          )}
          <Text strong>{formatProductAmount(discountedTotal, currency)}</Text>
        </Flex>

        <Button
          type={line.discountOpen ? "primary" : "text"}
          size="small"
          icon={<TagIcon size={17} />}
          aria-label={t("orders.create.products.toggleDiscount")}
          onClick={() => onToggleDiscount(line.variantId)}
        />
        <Button
          type="text"
          size="small"
          icon={<TrashIcon size={17} />}
          aria-label={t("orders.create.products.remove")}
          onClick={() => onRemove(line.variantId)}
        />
      </S.ProductLine>

      {line.discountOpen && (
        <S.LineDiscountRow align="center" gap={12}>
          <Text style={{ flex: 1 }}>
            {t("orders.create.products.positionDiscount")}
          </Text>
          <InputNumber
            min={0}
            max={99}
            precision={0}
            controls={false}
            addonAfter="%"
            value={line.discountPercent}
            onChange={(value) => onDiscountChange(line.variantId, value)}
          />
          <Button
            type="text"
            size="small"
            icon={<XIcon size={14} />}
            aria-label={t("orders.create.products.closeDiscount")}
            onClick={() => onToggleDiscount(line.variantId)}
          />
        </S.LineDiscountRow>
      )}
    </S.ProductLineBlock>
  );
}
