import {
  ArchiveIcon,
  ArrowClockwiseIcon,
  CubeIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { Button, Tooltip } from "antd";
import { useTranslation } from "react-i18next";

import { InteractiveVariantWishlistBadge } from "@/features/products/components/variant-wishlist-badge/interactive-variant-wishlist-badge";
import { buildCatalogVariantLabelFromVariant } from "@/features/products/utils/catalog-variant-display";

import type {
  Product,
  ProductVariant,
} from "@/features/products/model/product.types";
import {
  formatProductPrice,
  getVariantTitle,
  isArchivedStatus,
} from "@/features/products/utils/product-display";

import { ProductArchivedStatusTag } from "./product-archived-status-tag";
import * as S from "./products-list-variant-card.styled";

function getMarginPercent(
  price: number | null | undefined,
  purchasePrice: number | null | undefined,
): number | null {
  if (price == null || purchasePrice == null || purchasePrice <= 0) {
    return null;
  }

  return Math.round(((price - purchasePrice) / purchasePrice) * 100);
}

type ProductsListVariantCardProps = {
  product: Product;
  variant: ProductVariant;
  showInventoryQuantity: boolean;
  showInventoryManagement: boolean;
  deleteLoading?: boolean;
  archiveLoading?: boolean;
  onOpenInventory?: (product: Product, variantId: number) => void;
  onEdit?: (productId: number, focusVariantId?: number) => void;
  onArchive?: (product: Product, variant: ProductVariant) => void;
  onUnarchive?: (product: Product, variant: ProductVariant) => void;
  onDelete?: (product: Product, variant: ProductVariant) => void;
};

export function ProductsListVariantCard({
  product,
  variant,
  showInventoryQuantity,
  showInventoryManagement,
  deleteLoading = false,
  archiveLoading = false,
  onOpenInventory,
  onEdit,
  onArchive,
  onUnarchive,
  onDelete,
}: ProductsListVariantCardProps) {
  const { t } = useTranslation();
  const title =
    getVariantTitle(variant) ||
    `${t("products.variant.fallbackName")} #${variant.id}`;
  const sku = variant.sku?.trim() || "—";
  const quantity = variant.quantity ?? 0;
  const reservedQuantity = variant.reservedQuantity ?? 0;
  const availableQuantity = variant.availableQuantity ?? 0;
  const purchasePrice = variant.avgPurchasePrice;
  const marginPercent = getMarginPercent(variant.price, purchasePrice);
  const showPriceMetrics =
    showInventoryManagement &&
    purchasePrice != null &&
    Number.isFinite(purchasePrice) &&
    purchasePrice > 0;
  const isProductArchived = isArchivedStatus(product.status);
  const isVariantArchived = isArchivedStatus(variant.status);
  const canEdit = onEdit != null && !isProductArchived;
  const canManageInventory =
    showInventoryManagement &&
    onOpenInventory != null &&
    !isProductArchived &&
    !isVariantArchived;
  const archiveLabel = isVariantArchived
    ? t("products.unarchive")
    : t("products.archive");
  const showArchiveAction =
    (isVariantArchived && onUnarchive != null) ||
    (!isVariantArchived && onArchive != null);

  return (
    <S.VariantCard
      data-qa={`products-list-variant-${variant.id}`}
      $archived={isVariantArchived}
    >
      <S.VariantTopRow>
        <S.VariantTitleGroup>
          <InteractiveVariantWishlistBadge
            compact
            count={variant.wishlistCount}
            productId={product.id}
            subtitle={buildCatalogVariantLabelFromVariant(
              product.name,
              variant,
            )}
            variantId={variant.id}
          />
          <S.VariantTitle
            ellipsis={{ tooltip: title }}
            $clickable={canEdit}
            onClick={() => {
              if (canEdit) {
                onEdit(product.id, variant.id);
              }
            }}
          >
            {title}
          </S.VariantTitle>
          {isVariantArchived && !isProductArchived && (
            <ProductArchivedStatusTag />
          )}
        </S.VariantTitleGroup>

        <S.VariantActions>
          {canManageInventory && (
            <Tooltip title={t("products.inventoryDrawer.openVariantStockAria")}>
              <S.ActionButton
                type="text"
                size="small"
                icon={<CubeIcon size={14} />}
                aria-label={t("products.inventoryDrawer.openVariantStockAria")}
                data-qa={`products-list-variant-inventory-${variant.id}`}
                onClick={() => onOpenInventory(product, variant.id)}
              />
            </Tooltip>
          )}
          {showArchiveAction && (
            <Tooltip title={archiveLabel}>
              <S.ActionButton
                type="text"
                size="small"
                loading={archiveLoading}
                icon={
                  isVariantArchived ? (
                    <ArrowClockwiseIcon size={14} />
                  ) : (
                    <ArchiveIcon size={14} />
                  )
                }
                aria-label={archiveLabel}
                data-qa={`products-list-variant-archive-${variant.id}`}
                onClick={() =>
                  isVariantArchived
                    ? onUnarchive?.(product, variant)
                    : onArchive?.(product, variant)
                }
              />
            </Tooltip>
          )}
          {onDelete && (
            <Tooltip title={t("products.delete")}>
              <Button
                type="text"
                size="small"
                danger
                loading={deleteLoading}
                icon={<TrashIcon size={14} />}
                aria-label={t("products.delete")}
                data-qa={`products-list-variant-delete-${variant.id}`}
                onClick={() => onDelete(product, variant)}
              />
            </Tooltip>
          )}
        </S.VariantActions>
      </S.VariantTopRow>

      <S.VariantBottomRow>
        <S.VariantDetailsRow>
          <S.VariantSku ellipsis={{ tooltip: sku }}>{sku}</S.VariantSku>
          {showPriceMetrics && (
            <S.VariantPriceMetrics>
              <S.VariantSalePrice>
                {formatProductPrice(variant.price, product.currency)}
              </S.VariantSalePrice>
              <S.VariantPurchasePrice>
                {t("products.inventoryDrawer.purchasePrice")}{" "}
                {formatProductPrice(purchasePrice, product.currency)}
              </S.VariantPurchasePrice>
              {marginPercent != null && (
                <S.VariantMarginPercent
                  $tone={marginPercent >= 0 ? "positive" : "negative"}
                >
                  {marginPercent > 0 ? "+" : ""}
                  {marginPercent}%
                </S.VariantMarginPercent>
              )}
            </S.VariantPriceMetrics>
          )}
        </S.VariantDetailsRow>

        <S.StockMetrics>
          <S.StockMetric>
            <S.StockMetricValue>{quantity}</S.StockMetricValue>
            <S.StockMetricLabel type="secondary">
              {t("products.variant.quantity")}
            </S.StockMetricLabel>
          </S.StockMetric>
          {showInventoryQuantity && (
            <>
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
            </>
          )}
        </S.StockMetrics>
      </S.VariantBottomRow>
    </S.VariantCard>
  );
}
