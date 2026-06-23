import {
  CaretRightIcon,
  DotsThreeIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import type { TableColumnsType } from "antd";
import { Button, Dropdown, Flex, Modal, Typography, theme } from "antd";
import { Tag } from "@/components/tag/tag";
import { useMemo, type Key } from "react";
import { useTranslation } from "react-i18next";

import type { Product } from "@/features/products/model/product.types";
import {
  formatProductPrice,
  productStatusToColor,
} from "@/features/products/utils/product-display";

const { Text } = Typography;

type UseProductsTableColumnsParams = {
  categoryNameById: Map<number, string>;
  deleteLoadingId: number | null;
  expandedRowKeys: Key[];
  onToggleRowExpand: (productId: number) => void;
  onEdit: (productId: number) => void | Promise<void>;
  onDelete: (productId: number) => Promise<void>;
};

export const useProductsTableColumns = ({
  categoryNameById,
  deleteLoadingId,
  expandedRowKeys,
  onToggleRowExpand,
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
          const hasVariants = variantsCount > 0;
          const isExpanded =
            hasVariants && expandedRowKeys.includes(product.id);

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
                    width={48}
                    height={48}
                    style={{
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
                      width: 48,
                      height: 48,
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
                  {hasVariants && (
                    <Text italic type="secondary" ellipsis>
                      {t("products.table.variantsCount", {
                        count: variantsCount,
                      })}
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
        width: 100,
        render: (_, product) =>
          product.price != null
            ? formatProductPrice(product.price, product.currency)
            : t("products.noPrice"),
      },
      {
        title: t("products.table.stock"),
        key: "stock",
        width: 100,
        render: (_, product) => {
          if (product.inStock === false) {
            return t("products.outOfStock");
          }
          if (product.quantity == null) {
            return t("products.unknownQuantity");
          }

          return product.quantity;
        },
      },
      {
        title: t("products.table.status"),
        dataIndex: "status",
        key: "status",
        width: 100,
        render: (status: string) => (
          <Tag color={productStatusToColor(status)}>{status}</Tag>
        ),
      },
      {
        title: t("products.table.actions"),
        key: "actions",
        width: 50,
        render: (_, product) => (
          <div
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <Dropdown
              trigger={["click"]}
              menu={{
                items: [
                  {
                    key: "edit",
                    label: t("products.edit"),
                    icon: <PencilSimpleIcon size={16} />,
                  },
                  {
                    key: "delete",
                    label: t("products.delete"),
                    danger: true,
                    disabled: deleteLoadingId === product.id,
                    icon: <TrashIcon size={16} />,
                  },
                ],
                onClick: ({ key, domEvent }) => {
                  domEvent.stopPropagation();
                  if (key === "edit") {
                    void onEdit(product.id);
                    return;
                  }
                  if (key === "delete") {
                    Modal.confirm({
                      title: t("products.deleteConfirm"),
                      okText: t("products.delete"),
                      okType: "danger",
                      onOk: () => onDelete(product.id),
                    });
                  }
                },
              }}
            >
              <Button
                type="text"
                size="small"
                loading={deleteLoadingId === product.id}
                icon={<DotsThreeIcon size={25} />}
                aria-label={t("products.table.actions")}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              />
            </Dropdown>
          </div>
        ),
      },
    ],
    [
      categoryNameById,
      deleteLoadingId,
      expandedRowKeys,
      onDelete,
      onEdit,
      onToggleRowExpand,
      t,
      token.colorFillAlter,
    ],
  );
};
