import { CheckIcon } from "@phosphor-icons/react";
import { Alert, Button, Drawer, Empty, Flex, Spin, Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { useInventoryStore } from "@/features/inventory/model/use-inventory-store";
import { productsApi } from "@/features/products/api/products-api";
import type {
  Product,
  ProductDetails,
  ProductInventoryResponse,
  ProductInventoryVariant,
} from "@/features/products/model/product.types";

import { getVariantQuantity } from "./product-inventory-drawer.utils";
import { ProductInventoryVariantCard } from "./product-inventory-variant-card";

const { Text, Title } = Typography;

type ProductInventoryDrawerProps = {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  onOpenProduct: (productId: number) => void;
};

type ProductInventoryDrawerLoadState = {
  productId: number;
  inventory: ProductInventoryResponse | null;
  productDetails: ProductDetails | null;
  error: string | null;
  loading: boolean;
};

export const ProductInventoryDrawer = observer(
  ({ open, product, onClose, onOpenProduct }: ProductInventoryDrawerProps) => {
    const { t } = useTranslation();
    const inventoryStore = useInventoryStore();
    const productId = product?.id ?? null;
    const [loadState, setLoadState] =
      useState<ProductInventoryDrawerLoadState | null>(null);
    const [expandedVariantKeys, setExpandedVariantKeys] = useState<Set<string>>(
      () => new Set(),
    );
    const currentLoadState =
      productId != null && loadState?.productId === productId
        ? loadState
        : null;
    const inventory = currentLoadState?.inventory ?? null;
    const productDetails = currentLoadState?.productDetails ?? null;
    const loading =
      open && productId != null && currentLoadState?.loading !== false;
    const error = currentLoadState?.error ?? null;

    useEffect(() => {
      if (!open || productId == null) {
        return;
      }

      let alive = true;

      void Promise.resolve()
        .then(() => {
          if (!alive) {
            return null;
          }

          setLoadState({
            productId,
            inventory: null,
            productDetails: null,
            error: null,
            loading: true,
          });
          return Promise.all([
            productsApi.getInventory(productId),
            productsApi.getById(productId),
          ]);
        })
        .then((result) => {
          if (!alive || !result) {
            return;
          }

          const [nextInventory, nextProductDetails] = result;

          setLoadState({
            productId,
            inventory: nextInventory,
            productDetails: nextProductDetails,
            error: null,
            loading: false,
          });
        })
        .catch((nextError) => {
          if (!alive) {
            return;
          }

          setLoadState({
            productId,
            inventory: null,
            productDetails: null,
            error: getApiErrorMessage(
              nextError,
              t("products.inventoryDrawer.loadError"),
            ),
            loading: false,
          });
        });

      return () => {
        alive = false;
      };
    }, [open, productId, t]);

    const variantsById = useMemo(
      () =>
        new Map(
          (productDetails?.variants ?? []).map((variant) => [
            variant.id,
            variant,
          ]),
        ),
      [productDetails?.variants],
    );

    const variants = inventory?.variants ?? [];
    const productName = productDetails?.name ?? product?.name ?? "";
    const currency = productDetails?.currency ?? product?.currency ?? "";
    const totalQuantity = variants.reduce(
      (total, variant) => total + getVariantQuantity(variant),
      0,
    );

    const toggleVariantExpanded = (variantKey: string, variantId: number) => {
      const shouldLoadMovements = !expandedVariantKeys.has(variantKey);

      setExpandedVariantKeys((current) => {
        const next = new Set(current);

        if (next.has(variantKey)) {
          next.delete(variantKey);
        } else {
          next.add(variantKey);
        }

        return next;
      });

      if (shouldLoadMovements) {
        void inventoryStore
          .loadVariantMovements(variantId)
          .catch(() => undefined);
      }
    };

    const renderVariantCard = (variant: ProductInventoryVariant) => {
      const variantKey = `${inventory?.productId ?? productId ?? "product"}:${variant.variantId}`;

      return (
        <ProductInventoryVariantCard
          key={variant.variantId}
          variant={variant}
          detailVariant={variantsById.get(variant.variantId)}
          currency={currency}
          fallbackName={`${t("products.variant.fallbackName")} #${variant.variantId}`}
          expanded={expandedVariantKeys.has(variantKey)}
          movements={inventoryStore.getVariantMovements(variant.variantId)}
          movementsLoading={inventoryStore.isVariantMovementsLoading(
            variant.variantId,
          )}
          movementsError={inventoryStore.getVariantMovementsError(
            variant.variantId,
          )}
          onToggleExpanded={() =>
            toggleVariantExpanded(variantKey, variant.variantId)
          }
          onRetryMovements={() => {
            void inventoryStore
              .loadVariantMovements(variant.variantId, { force: true })
              .catch(() => undefined);
          }}
        />
      );
    };

    return (
      <Drawer
        open={open}
        title={
          <Flex vertical gap={4}>
            <Title level={4} style={{ margin: 0 }}>
              {t("products.inventoryDrawer.title")}
            </Title>
            <Text type="secondary">
              {t("products.inventoryDrawer.totalUnits", {
                productName,
                count: totalQuantity,
              })}
            </Text>
          </Flex>
        }
        size={600}
        destroyOnHidden
        footer={
          <Flex gap={12}>
            <Button
              block
              disabled={!productDetails}
              onClick={() => {
                if (productDetails) {
                  onOpenProduct(productDetails.id);
                }
              }}
            >
              {t("products.inventoryDrawer.openProduct")}
            </Button>
            <Button block type="primary" icon={<CheckIcon />} onClick={onClose}>
              {t("products.inventoryDrawer.done")}
            </Button>
          </Flex>
        }
        onClose={onClose}
      >
        {loading ? (
          <Flex align="center" justify="center" style={{ minHeight: 240 }}>
            <Spin />
          </Flex>
        ) : error ? (
          <Alert type="error" title={error} showIcon />
        ) : variants.length === 0 ? (
          <Empty description={t("products.inventoryDrawer.empty")} />
        ) : (
          <Flex vertical gap={10}>
            {variants.map(renderVariantCard)}
          </Flex>
        )}
      </Drawer>
    );
  },
);
