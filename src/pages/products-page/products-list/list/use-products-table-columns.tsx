import {
  CaretRightIcon,
  CubeIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import type { TableColumnsType } from "antd";
import { Button, Flex, Modal, Tooltip, Typography, theme } from "antd";
// import { Tag } from "@/components/tag/tag";
import { useMemo, type Key } from "react";
import { useTranslation } from "react-i18next";

import type { Product } from "@/features/products/model/product.types";
import {
  formatProductVariantListMetaLine,
  getProductPriceRange,
  getSingleVariantListMeta,
  // productStatusToColor,
} from "@/features/products/utils/product-display";

const { Text } = Typography;

type UseProductsTableColumnsParams = {
  categoryNameById: Map<number, string>;
  deleteLoadingId: number | null;
  expandedRowKeys: Key[];
  showInventoryQuantity: boolean;
  showInventoryManagement: boolean;
  onToggleRowExpand: (productId: number) => void;
  onOpenInventory: (product: Product) => void;
  onEdit: (productId: number) => void | Promise<void>;
  onDelete: (productId: number) => Promise<void>;
};

export const useProductsTableColumns = ({
  categoryNameById,
  deleteLoadingId,
  expandedRowKeys,
  showInventoryQuantity,
  showInventoryManagement,
  onToggleRowExpand,
  onOpenInventory,
  onEdit,
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
          const hasMultipleVariants = variantsCount > 1;
          const singleVariantMeta = getSingleVariantListMeta(product);
          const isExpanded =
            hasMultipleVariants && expandedRowKeys.includes(product.id);
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
              {hasMultipleVariants ? (
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
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleRowExpand(product.id);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                />
              ) : (
                <span aria-hidden style={{ width: 24, flexShrink: 0 }} />
              )}
              <Flex align="center" gap={8} style={{ minWidth: 0, flex: 1 }}>
                {product.mainImageUrl ? (
                  <img
                    src={product.mainImageUrl}
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
                ) : (
                  <div
                    aria-hidden
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 8,
                      backgroundColor: token.colorFillAlter,
                      flexShrink: 0,
                    }}
                  />
                )}
                <Flex vertical gap={0} style={{ minWidth: 0, flex: 1 }}>
                  <Text strong ellipsis style={{ maxWidth: 260 }}>
                    {product.name}
                  </Text>
                  {variantsCount > 0 && (
                    <Text italic type="secondary" ellipsis>
                      {variantSecondaryLine}
                    </Text>
                  )}
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
      // {
      //   title: t("products.table.status"),
      //   dataIndex: "status",
      //   key: "status",
      //   width: 100,
      //   render: (status: string) => (
      //     <Tag color={productStatusToColor(status)}>{status}</Tag>
      //   ),
      // },
      {
        title: t("products.table.actions"),
        key: "actions",
        width: 120,
        render: (_, product) => (
          <Flex
            align="center"
            gap={4}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {showInventoryManagement ? (
              <Tooltip title={t("system.inventory.title")}>
                <Button
                  type="text"
                  size="small"
                  icon={<CubeIcon size={16} />}
                  aria-label={t("system.inventory.title")}
                  onClick={() => onOpenInventory(product)}
                />
              </Tooltip>
            ) : null}
            <Tooltip title={t("products.edit")}>
              <Button
                type="text"
                size="small"
                icon={<PencilSimpleIcon size={16} />}
                aria-label={t("products.edit")}
                onClick={() => void onEdit(product.id)}
              />
            </Tooltip>
            <Tooltip title={t("products.delete")}>
              <Button
                type="text"
                size="small"
                danger
                loading={deleteLoadingId === product.id}
                icon={<TrashIcon size={16} />}
                aria-label={t("products.delete")}
                onClick={() => {
                  Modal.confirm({
                    title: t("products.deleteConfirm"),
                    okText: t("products.delete"),
                    okType: "danger",
                    onOk: () => onDelete(product.id),
                  });
                }}
              />
            </Tooltip>
          </Flex>
        ),
      },
    ],
    [
      categoryNameById,
      deleteLoadingId,
      expandedRowKeys,
      onDelete,
      onEdit,
      onOpenInventory,
      onToggleRowExpand,
      showInventoryManagement,
      showInventoryQuantity,
      t,
      token.colorFillAlter,
    ],
  );
};
