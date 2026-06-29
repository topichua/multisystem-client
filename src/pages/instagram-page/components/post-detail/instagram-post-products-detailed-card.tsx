import { CaretDownIcon, CaretRightIcon, XIcon } from "@phosphor-icons/react";
import { Avatar, Button, Card, Empty, Flex, Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";

import type {
  InstagramIntegrationId,
  InstagramPostProduct,
} from "@/features/instagram/model/instagram.types";
import { useInstagramStore } from "@/features/instagram/model/use-instagram-store";
import {
  formatProductPrice,
  getLinkedProductVariants,
  getProductPriceRange,
  getProductRowUnlinkReferenceId,
  getProductVariantTitle,
  variantStatusToColor,
} from "@/features/products/utils/product-display";
import { Tag } from "@/components/tag/tag";
import { useNotification } from "@/shared/components/notification/use-notification";

const { Text } = Typography;

type InstagramPostProductsTableProps = {
  postId: string;
  products: InstagramPostProduct[];
};

export const InstagramPostProductsDetailedCard = observer(
  ({ postId, products }: InstagramPostProductsTableProps) => {
    const { t } = useTranslation();
    const store = useInstagramStore();
    const notification = useNotification();

    const [expandedProductIds, setExpandedProductIds] = useState<Set<string>>(
      () => new Set(),
    );

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
            aria-label={t("instagram.unlinkProductAria")}
            icon={<XIcon size={18} />}
            loading={isUnlinking}
            disabled={store.unlinkProductReferenceId != null && !isUnlinking}
            onClick={() => handleUnlinkReference(productId, referenceId)}
          />
        );
      },
      [handleUnlinkReference, store.unlinkProductReferenceId, t],
    );

    const handleToggleProduct = useCallback(
      (productId: InstagramIntegrationId) => {
        const key = String(productId);

        setExpandedProductIds((previous) => {
          const next = new Set(previous);

          if (next.has(key)) {
            next.delete(key);
          } else {
            next.add(key);
          }

          return next;
        });
      },
      [],
    );

    const renderExpandedRow = (product: InstagramPostProduct) => {
      const linkedVariants = getLinkedProductVariants(product);
      const showVariantUnlinkButtons = linkedVariants.length > 1;

      if (!product.variants?.length) {
        return (
          <Text type="secondary" style={{ display: "block", padding: 16 }}>
            {t("products.table.noVariants")}
          </Text>
        );
      }

      return (
        <Flex vertical gap={8} style={{ paddingLeft: 32 }}>
          {product.variants.map((variant) => {
            const title = getProductVariantTitle(variant);
            const referenceId = variant.referenceId;

            return (
              <Card
                key={String(variant.id)}
                size="small"
                styles={{
                  body: {
                    padding: 12,
                  },
                }}
              >
                <Flex align="center" justify="space-between" gap={16}>
                  <Text strong style={{ flex: "1 1 160px", minWidth: 0 }}>
                    {title ||
                      `${t("products.variant.fallbackName")} #${variant.id}`}
                  </Text>

                  <Flex
                    align="center"
                    gap={12}
                    wrap="wrap"
                    style={{ flex: "1 1 220px", minWidth: 0 }}
                  >
                    <Tag color={variantStatusToColor(variant.status)}>
                      {variant.status}
                    </Tag>

                    <Text type="secondary" style={{ minWidth: 80 }}>
                      {variant.sku || "—"}
                    </Text>

                    <Text strong style={{ minWidth: 80 }}>
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
        {products.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t("instagram.noLinkedProducts")}
          />
        ) : (
          <Flex vertical gap={8}>
            {products.map((product) => {
              const productKey = String(product.id);
              const variantsCount = product.variants?.length ?? 0;
              const hasVariants = variantsCount > 0;
              const isExpanded = expandedProductIds.has(productKey);
              const referenceId = getProductRowUnlinkReferenceId(product);
              const priceRange = getProductPriceRange(product);

              const availabilityTag =
                product.inStock === false ? (
                  <Tag color="error">{t("products.outOfStock")}</Tag>
                ) : product.quantity != null ? (
                  <Tag color="success">{product.quantity} шт.</Tag>
                ) : null;

              return (
                <Card
                  key={productKey}
                  size="small"
                  styles={{
                    body: {
                      padding: 12,
                    },
                  }}
                >
                  <Flex vertical gap={isExpanded ? 12 : 0}>
                    <Flex align="center" gap={8}>
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
                          aria-controls={`product-variants-${productKey}`}
                          icon={
                            isExpanded ? (
                              <CaretDownIcon size={16} />
                            ) : (
                              <CaretRightIcon size={16} />
                            )
                          }
                          onClick={() => handleToggleProduct(product.id)}
                        />
                      ) : (
                        <span
                          aria-hidden
                          style={{ display: "block", width: 24 }}
                        />
                      )}

                      <Avatar
                        shape="square"
                        size={44}
                        src={product.mainImageUrl}
                      >
                        {product.name[0]?.toUpperCase()}
                      </Avatar>

                      <Flex
                        vertical
                        gap={0}
                        style={{
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <Text strong ellipsis>
                          {product.name}
                        </Text>

                        {(hasVariants || priceRange) && (
                          <Flex align="center" gap={4}>
                            {hasVariants && (
                              <Text type="secondary" ellipsis>
                                {t("products.table.variantsCount", {
                                  count: variantsCount,
                                })}
                              </Text>
                            )}

                            {hasVariants && priceRange && (
                              <Text type="secondary">·</Text>
                            )}

                            {priceRange && (
                              <Text type="secondary" ellipsis>
                                {priceRange}
                              </Text>
                            )}
                            <Text type="secondary">·</Text>
                            {availabilityTag}
                          </Flex>
                        )}
                      </Flex>

                      <Flex align="center" gap={4} style={{ flexShrink: 0 }}>
                        {referenceId != null
                          ? renderUnlinkButton(product.id, referenceId)
                          : null}
                      </Flex>
                    </Flex>

                    {isExpanded ? (
                      <div id={`product-variants-${productKey}`}>
                        {renderExpandedRow(product)}
                      </div>
                    ) : null}
                  </Flex>
                </Card>
              );
            })}
          </Flex>
        )}
      </>
    );
  },
);
