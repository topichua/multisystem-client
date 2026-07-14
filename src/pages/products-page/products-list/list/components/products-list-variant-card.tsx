import { CubeIcon, PencilSimpleIcon } from "@phosphor-icons/react";
import { Tooltip } from "antd";
import type { MouseEvent } from "react";
import { useTranslation } from "react-i18next";

import { VariantWishlistBadge } from "@/features/products/components/variant-wishlist-badge/variant-wishlist-badge";

import type {
  Product,
  ProductVariant,
} from "@/features/products/model/product.types";
import { getVariantTitle } from "@/features/products/utils/product-display";

import * as S from "./products-list-variant-card.styled";

type ProductsListVariantCardProps = {
  product: Product;
  variant: ProductVariant;
  showInventoryQuantity: boolean;
  showInventoryManagement: boolean;
  onOpenInventory?: (product: Product, variantId: number) => void;
  onEdit?: (productId: number) => void;
};

const stopCardNavigation = (event: MouseEvent<HTMLElement>) => {
  event.stopPropagation();
};

export function ProductsListVariantCard({
  product,
  variant,
  showInventoryQuantity,
  showInventoryManagement,
  onOpenInventory,
  onEdit,
}: ProductsListVariantCardProps) {
  const { t } = useTranslation();
  const title =
    getVariantTitle(variant) ||
    `${t("products.variant.fallbackName")} #${variant.id}`;
  const sku = variant.sku?.trim() || "—";
  const quantity = variant.quantity ?? 0;
  const reservedQuantity = variant.reservedQuantity ?? 0;
  const availableQuantity = variant.availableQuantity ?? 0;

  return (
    <S.VariantCard data-qa={`products-list-variant-${variant.id}`}>
      <S.VariantTopRow>
        <S.VariantTitleGroup>
          <VariantWishlistBadge count={variant.wishlistCount} />
          <S.VariantTitle ellipsis={{ tooltip: title }}>{title}</S.VariantTitle>
        </S.VariantTitleGroup>

        <S.VariantActions>
          {showInventoryManagement && onOpenInventory && (
            <Tooltip title={t("products.inventoryDrawer.openVariantStockAria")}>
              <S.ActionButton
                type="text"
                size="small"
                icon={<CubeIcon size={16} />}
                aria-label={t("products.inventoryDrawer.openVariantStockAria")}
                data-qa={`products-list-variant-inventory-${variant.id}`}
                onClick={(event) => {
                  stopCardNavigation(event);
                  onOpenInventory(product, variant.id);
                }}
                onMouseDown={stopCardNavigation}
                onPointerDown={stopCardNavigation}
              />
            </Tooltip>
          )}
          {onEdit && (
            <Tooltip title={t("products.edit")}>
              <S.ActionButton
                type="text"
                size="small"
                icon={<PencilSimpleIcon size={16} />}
                aria-label={t("products.edit")}
                data-qa={`products-list-variant-edit-${variant.id}`}
                onClick={(event) => {
                  stopCardNavigation(event);
                  onEdit(product.id);
                }}
                onMouseDown={stopCardNavigation}
                onPointerDown={stopCardNavigation}
              />
            </Tooltip>
          )}
        </S.VariantActions>
      </S.VariantTopRow>

      <S.VariantBottomRow>
        <S.VariantSku ellipsis={{ tooltip: sku }}>{sku}</S.VariantSku>

        {showInventoryQuantity && (
          <S.StockMetrics>
            <S.StockMetric>
              <S.StockMetricValue>{quantity}</S.StockMetricValue>
              <S.StockMetricLabel type="secondary">
                {t("products.variant.quantity")}
              </S.StockMetricLabel>
            </S.StockMetric>
            <S.StockMetric>
              <S.StockMetricValue>{reservedQuantity}</S.StockMetricValue>
              <S.StockMetricLabel type="secondary">
                {t("products.variant.reserved")}
              </S.StockMetricLabel>
            </S.StockMetric>
            <S.StockMetric>
              <S.StockMetricValue>{availableQuantity}</S.StockMetricValue>
              <S.StockMetricLabel type="secondary">
                {t("products.variant.available")}
              </S.StockMetricLabel>
            </S.StockMetric>
          </S.StockMetrics>
        )}
      </S.VariantBottomRow>
    </S.VariantCard>
  );
}
