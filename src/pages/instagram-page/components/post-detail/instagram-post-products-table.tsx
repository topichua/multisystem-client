/**
 * @deprecated use InstagramPostProductsDetailedCard instead
 */

import { CaretRightIcon, TrashIcon } from "@phosphor-icons/react";
import type { TableColumnsType } from "antd";
import { Button, Card, Empty, Flex, Table, Typography, theme } from "antd";
import { observer } from "mobx-react-lite";
import { useCallback, useMemo, useState, type Key } from "react";
import { useTranslation } from "react-i18next";
import { Tag } from "@/components/tag/tag";
import { getApiErrorMessage } from "@/api/get-api-error-message";
import type {
  InstagramIntegrationId,
  InstagramPostProduct,
  InstagramPostProductVariant,
} from "@/features/instagram/model/instagram.types";
import { useInstagramStore } from "@/features/instagram/model/use-instagram-store";
import {
  formatProductPrice,
  productStatusToColor,
  variantStatusToColor,
} from "@/features/products/utils/product-display";

import * as S from "../../instagram-page.styled";
import { useNotification } from "@/shared/components/notification/use-notification";

const { Text } = Typography;

type InstagramPostProductsTableProps = {
  postId: string;
  products: InstagramPostProduct[];
};

const idToRowKey = (id: InstagramIntegrationId): Key => String(id);

const getVariantTitle = (variant: InstagramPostProductVariant): string =>
  [...(variant.customFields ?? [])]
    .filter(
      (field): field is { value?: unknown; order?: unknown } =>
        typeof field === "object" && field !== null,
    )
    .sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0))
    .map((field) => (typeof field.value === "string" ? field.value : null))
    .filter(Boolean)
    .join(" / ");

const getLinkedVariants = (
  product: InstagramPostProduct,
): InstagramPostProductVariant[] =>
  (product.variants ?? []).filter((variant) => variant.referenceId != null);

const getProductRowUnlinkReferenceId = (
  product: InstagramPostProduct,
): InstagramIntegrationId | null => {
  const linkedVariants = getLinkedVariants(product);

  if (linkedVariants.length === 1) {
    return linkedVariants[0].referenceId ?? null;
  }

  if (linkedVariants.length === 0 && product.referenceId != null) {
    return product.referenceId;
  }

  return null;
};

export const InstagramPostProductsTable = observer(
  ({ postId, products }: InstagramPostProductsTableProps) => {
    const { t } = useTranslation();
    const store = useInstagramStore();
    const notification = useNotification();
    const { token } = theme.useToken();
    const [expandedRowKeys, setExpandedRowKeys] = useState<Key[]>([]);

    const handleUnlinkReference = useCallback(
      (
        productId: InstagramIntegrationId,
        referenceId: InstagramIntegrationId,
      ) => {
        void store
          .unlinkProductFromPost({
            productId: Number(productId),
            referenceId,
            postId,
          })
          .then(() => {
            notification.success({
              title: t("instagram.unlinkProductSuccess"),
            });
          })
          .catch((error: unknown) => {
            notification.error({
              title: getApiErrorMessage(
                error,
                t("instagram.unlinkProductFailed"),
              ),
            });
          });
      },
      [notification, postId, store, t],
    );

    const renderUnlinkButton = useCallback(
      (
        productId: InstagramIntegrationId,
        referenceId: InstagramIntegrationId,
      ) => {
        const isUnlinking =
          String(store.unlinkProductReferenceId) === String(referenceId);

        return (
          <Button
            type="text"
            danger
            aria-label={t("instagram.unlinkProductAria")}
            icon={<TrashIcon size={18} />}
            loading={isUnlinking}
            disabled={store.unlinkProductReferenceId != null && !isUnlinking}
            onClick={() => handleUnlinkReference(productId, referenceId)}
          />
        );
      },
      [handleUnlinkReference, store.unlinkProductReferenceId, t],
    );

    const handleToggleRowExpand = useCallback(
      (productId: InstagramIntegrationId) => {
        const rowKey = idToRowKey(productId);

        setExpandedRowKeys((prev) =>
          prev.includes(rowKey)
            ? prev.filter((key) => key !== rowKey)
            : [...prev, rowKey],
        );
      },
      [],
    );

    const columns: TableColumnsType<InstagramPostProduct> = useMemo(
      () => [
        {
          title: t("products.table.product"),
          key: "product",
          width: 360,
          render: (_, product) => {
            const variantsCount = product.variants?.length ?? 0;
            const hasVariants = variantsCount > 0;
            const rowKey = idToRowKey(product.id);
            const isExpanded = hasVariants && expandedRowKeys.includes(rowKey);

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
                    onClick={(event) => {
                      event.stopPropagation();
                      handleToggleRowExpand(product.id);
                    }}
                    onMouseDown={(event) => event.stopPropagation()}
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
                    {hasVariants ? (
                      <Text italic type="secondary" ellipsis>
                        {t("products.table.variantsCount", {
                          count: variantsCount,
                        })}
                      </Text>
                    ) : null}
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
          render: (categoryId: InstagramPostProduct["categoryId"]) =>
            categoryId != null ? `#${categoryId}` : t("products.noCategory"),
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
          key: "actions",
          width: 56,
          fixed: "right",
          render: (_, product) => {
            const referenceId = getProductRowUnlinkReferenceId(product);

            if (referenceId == null) {
              return null;
            }

            return renderUnlinkButton(product.id, referenceId);
          },
        },
      ],
      [
        expandedRowKeys,
        handleToggleRowExpand,
        renderUnlinkButton,
        t,
        token.colorFillAlter,
      ],
    );

    const renderExpandedRow = (product: InstagramPostProduct) => {
      const linkedVariants = getLinkedVariants(product);
      const showVariantUnlinkButtons = linkedVariants.length > 1;

      if (!product.variants?.length) {
        return (
          <Text type="secondary" style={{ display: "block", padding: 16 }}>
            {t("products.table.noVariants")}
          </Text>
        );
      }

      return (
        <Flex vertical gap={8} style={{ paddingLeft: "5%" }}>
          {product.variants.map((variant) => {
            const title = getVariantTitle(variant);
            const referenceId = variant.referenceId;

            return (
              <Card
                key={String(variant.id)}
                styles={{
                  body: {
                    padding: 12,
                  },
                }}
              >
                <Flex align="center" justify="space-between" gap={16}>
                  <Text strong style={{ flex: "1 1 auto", minWidth: 240 }}>
                    {title ||
                      `${t("products.variant.fallbackName")} #${variant.id}`}
                  </Text>

                  <Flex align="center" gap={24} style={{ flexShrink: 0 }}>
                    <Tag color={variantStatusToColor(variant.status)}>
                      {variant.status}
                    </Tag>

                    <Text type="secondary" style={{ minWidth: 110 }}>
                      {variant.sku || "—"}
                    </Text>

                    <Text strong style={{ minWidth: 90 }}>
                      {formatProductPrice(variant.price, product.currency)}
                    </Text>

                    <Flex gap={8} align="baseline" style={{ minWidth: 80 }}>
                      <Text type="secondary">
                        {t("products.variant.quantity")}
                      </Text>
                      <Text
                        type={variant.quantity === 0 ? "danger" : undefined}
                        strong
                      >
                        {variant.quantity ?? "—"}
                      </Text>
                    </Flex>

                    {referenceId != null && showVariantUnlinkButtons
                      ? renderUnlinkButton(product.id, referenceId)
                      : null}
                  </Flex>
                </Flex>
              </Card>
            );
          })}
        </Flex>
      );
    };

    return (
      <>
        <S.PostProductsTableWrapper>
          <Table<InstagramPostProduct>
            rowKey={(product) => idToRowKey(product.id)}
            columns={columns}
            dataSource={products}
            pagination={false}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={t("instagram.noLinkedProducts")}
                />
              ),
            }}
            scroll={{ x: "max-content" }}
            expandable={{
              showExpandColumn: false,
              expandedRowRender: renderExpandedRow,
              rowExpandable: (product) => Boolean(product.variants?.length),
              expandedRowKeys,
              onExpand: (expanded, product) => {
                const rowKey = idToRowKey(product.id);

                setExpandedRowKeys((prev) =>
                  expanded
                    ? prev.includes(rowKey)
                      ? prev
                      : [...prev, rowKey]
                    : prev.filter((key) => key !== rowKey),
                );
              },
              expandRowByClick: false,
            }}
          />
        </S.PostProductsTableWrapper>
      </>
    );
  },
);
