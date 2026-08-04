import {
  ArchiveIcon,
  ArrowClockwiseIcon,
  CaretRightIcon,
  CubeIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import type { TableColumnsType } from "antd";
import { Button, Flex, Tooltip, Typography, theme } from "antd";
import { useMemo, type Key } from "react";
import { useTranslation } from "react-i18next";

import type { Product } from "@/features/products/model/product.types";
import {
  formatProductVariantListMetaLine,
  getProductPriceRange,
  getSingleVariantListMeta,
  isArchivedStatus,
  resolveProductImageSrc,
} from "@/features/products/utils/product-display";

import { ProductArchivedStatusTag } from "./components/product-archived-status-tag";
import * as S from "./products-list-page.styled";

const { Text } = Typography;

type UseProductsTableColumnsParams = {
  categoryNameById: Map<number, string>;
  deleteLoadingId: number | null;
  archiveLoadingId: number | null;
  expandedRowKeys: Key[];
  showInventoryQuantity: boolean;
  showInventoryManagement: boolean;
  onToggleRowExpand: (productId: number) => void;
  onOpenInventory: (product: Product) => void;
  onEdit: (productId: number, focusVariantId?: number) => void | Promise<void>;
  onArchive: (product: Product) => void;
  onUnarchive: (product: Product) => void;
  onDelete: (product: Product) => void;
};

export const useProductsTableColumns = ({
  categoryNameById,
  deleteLoadingId,
  archiveLoadingId,
  expandedRowKeys,
  showInventoryQuantity,
  showInventoryManagement,
  onToggleRowExpand,
  onOpenInventory,
  onEdit,
  onArchive,
  onUnarchive,
  onDelete,
}: UseProductsTableColumnsParams): TableColumnsType<Product> => {
  const { t } = useTranslation();
  const { token } = theme.useToken();

  return useMemo(
    () => [
      {
        title: t("products.table.product"),
        key: "product",
        width: 360,
        render: (_, product) => {
          const variantsCount = product.variants?.length ?? 0;
          const hasVariants = variantsCount > 0;
          const singleVariantMeta = getSingleVariantListMeta(product);
          const isExpanded =
            hasVariants && expandedRowKeys.includes(product.id);
          const isArchived = isArchivedStatus(product.status);
          const variantSecondaryLine = singleVariantMeta
            ? formatProductVariantListMetaLine(
                singleVariantMeta,
                t("products.variant.fallbackName"),
              )
            : t("products.table.variantsCount", {
                count: variantsCount,
              });

          return (
            <Flex align="center" gap={4}>
              {hasVariants ? (
                <Button
                  type="text"
                  size="small"
                  aria-label={
                    isExpanded
                      ? t("products.table.collapseRowAria")
                      : t("products.table.expandRowAria")
                  }
                  aria-expanded={isExpanded}
                  icon={
                    <CaretRightIcon
                      size={16}
                      style={{
                        transform: isExpanded ? "rotate(90deg)" : undefined,
                        transition: "transform 0.2s ease",
                      }}
                    />
                  }
                  onClick={() => {
                    onToggleRowExpand(product.id);
                  }}
                />
              ) : (
                <span aria-hidden style={{ width: 24, flexShrink: 0 }} />
              )}
              <Flex align="center" gap={8} style={{ minWidth: 0, flex: 1 }}>
                <img
                  src={resolveProductImageSrc(product.mainImageUrl)}
                  alt={product.name}
                  width={44}
                  height={44}
                  style={{
                    width: 44,
                    height: 44,
                    objectFit: "cover",
                    borderRadius: 8,
                    backgroundColor: token.colorFillAlter,
                    flexShrink: 0,
                  }}
                />
                <Flex vertical gap={0} style={{ minWidth: 0, flex: 1 }}>
                  <Flex
                    align="center"
                    gap={8}
                    style={{ minWidth: 0, maxWidth: "100%" }}
                  >
                    {isArchived ? (
                      <Tooltip title={t("products.archivedCannotEdit")}>
                        <S.ProductNameMuted strong ellipsis>
                          {product.name}
                        </S.ProductNameMuted>
                      </Tooltip>
                    ) : (
                      <S.ProductNameLink
                        strong
                        ellipsis
                        onClick={() => void onEdit(product.id)}
                      >
                        {product.name}
                      </S.ProductNameLink>
                    )}
                    {isArchived && <ProductArchivedStatusTag />}
                  </Flex>
                  {variantsCount > 0 &&
                    (singleVariantMeta != null &&
                    product.variants?.[0]?.id != null &&
                    !isArchived ? (
                      <S.VariantMetaLink
                        italic
                        type="secondary"
                        ellipsis
                        onClick={() =>
                          void onEdit(product.id, product.variants![0].id)
                        }
                      >
                        {variantSecondaryLine}
                      </S.VariantMetaLink>
                    ) : (
                      <Text italic type="secondary" ellipsis>
                        {variantSecondaryLine}
                      </Text>
                    ))}
                </Flex>
              </Flex>
            </Flex>
          );
        },
      },
      {
        title: t("products.table.category"),
        dataIndex: "categoryId",
        key: "categoryId",
        width: 100,
        render: (categoryId: Product["categoryId"]) =>
          categoryId != null
            ? (categoryNameById.get(categoryId) ?? `#${categoryId}`)
            : t("products.noCategory"),
      },
      {
        title: t("products.table.price"),
        key: "price",
        width: 140,
        render: (_, product) =>
          getProductPriceRange(product) ?? t("products.noPrice"),
      },
      ...(showInventoryQuantity
        ? [
            {
              title: t("products.table.stock"),
              key: "stock",
              width: 100,
              render: (_: unknown, product: Product) => {
                if (product.inStock === false) {
                  return t("products.outOfStock");
                }
                if (product.quantity == null) {
                  return t("products.unknownQuantity");
                }

                return product.quantity;
              },
            },
          ]
        : []),
      {
        title: t("products.table.actions"),
        key: "actions",
        width: 120,
        render: (_, product) => {
          const isArchived = isArchivedStatus(product.status);
          const archiveLabel = isArchived
            ? t("products.unarchive")
            : t("products.archive");

          return (
            <Flex align="center">
              {showInventoryManagement && !isArchived && (
                <Tooltip title={t("system.inventory.title")}>
                  <Button
                    type="text"
                    size="small"
                    icon={<CubeIcon size={14} />}
                    aria-label={t("system.inventory.title")}
                    onClick={() => onOpenInventory(product)}
                  />
                </Tooltip>
              )}
              <Tooltip title={archiveLabel}>
                <Button
                  type="text"
                  size="small"
                  loading={archiveLoadingId === product.id}
                  icon={
                    isArchived ? (
                      <ArrowClockwiseIcon size={14} />
                    ) : (
                      <ArchiveIcon size={14} />
                    )
                  }
                  aria-label={archiveLabel}
                  onClick={() =>
                    isArchived ? onUnarchive(product) : onArchive(product)
                  }
                />
              </Tooltip>
              <Tooltip title={t("products.delete")}>
                <Button
                  type="text"
                  size="small"
                  danger
                  loading={deleteLoadingId === product.id}
                  icon={<TrashIcon size={14} />}
                  aria-label={t("products.delete")}
                  onClick={() => onDelete(product)}
                />
              </Tooltip>
            </Flex>
          );
        },
      },
    ],
    [
      archiveLoadingId,
      categoryNameById,
      deleteLoadingId,
      expandedRowKeys,
      onArchive,
      onDelete,
      onEdit,
      onOpenInventory,
      onToggleRowExpand,
      onUnarchive,
      showInventoryManagement,
      showInventoryQuantity,
      t,
      token.colorFillAlter,
    ],
  );
};
