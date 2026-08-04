import { CheckIcon } from "@phosphor-icons/react";
import { Alert, Button, Drawer, Empty, Flex, Spin, Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import type {
  InitialStockValues,
  InventoryStock,
  StockCorrectionValues,
  StockPurchaseValues,
} from "@/features/inventory/model/inventory.types";
import { INVENTORY_MOVEMENTS_PREVIEW_LIMIT } from "@/features/inventory/model/inventory.types";
import { useInventoryStore } from "@/features/inventory/model/use-inventory-store";
import { productsApi } from "@/features/products/api/products-api";
import type {
  Product,
  ProductDetails,
  ProductInventoryResponse,
  ProductInventoryVariant,
} from "@/features/products/model/product.types";

import { getVariantQuantity } from "./product-inventory-drawer.utils";
import { getInventoryDrawerLayoutProps } from "./product-inventory-drawer-layout";
import { ProductInventoryVariantCard } from "./product-inventory-variant-card";
import { useIsMobileViewport } from "@/utils/use-media-query";

const { Text, Title } = Typography;

type ProductInventoryDrawerProps = {
  open: boolean;
  product: Product | null;
  targetVariantId?: number | null;
  targetVariantFocusId?: number;
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

function getInventoryVariantKey(productId: number | null, variantId: number) {
  return `${productId ?? "product"}:${variantId}`;
}

function applyInventoryStock(
  variant: ProductInventoryVariant,
  stock: InventoryStock,
): ProductInventoryVariant {
  const reservedQuantity = Number(variant.reservedQuantity ?? 0);

  return {
    ...variant,
    quantity: stock.quantity,
    reservedQuantity,
    availableQuantity: stock.quantity - reservedQuantity,
    stockQty: stock.quantity,
    stockCostTotal: stock.totalCost,
    averagePurchasePrice: stock.avgPurchasePrice,
    stockInitialized: stock.stockInitialized,
    requiresInitialization: stock.requiresInitialization,
  };
}

export const ProductInventoryDrawer = observer(
  ({
    open,
    product,
    targetVariantId = null,
    targetVariantFocusId = 0,
    onClose,
    onOpenProduct,
  }: ProductInventoryDrawerProps) => {
    const { t } = useTranslation();
    const isMobileViewport = useIsMobileViewport();
    const drawerLayout = getInventoryDrawerLayoutProps({
      isMobile: isMobileViewport,
      desktopSize: 600,
    });
    const inventoryStore = useInventoryStore();
    const productId = product?.id ?? null;
    const variantCardElementByVariantIdRef = useRef(
      new Map<number, HTMLDivElement>(),
    );
    const handledTargetVariantFocusRef = useRef<string | null>(null);
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
      if (!open) {
        setExpandedVariantKeys(new Set());
        handledTargetVariantFocusRef.current = null;
      }
    }, [open]);

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
    const targetVariantExists =
      targetVariantId != null &&
      variants.some((variant) => variant.variantId === targetVariantId);

    useEffect(() => {
      if (
        !open ||
        productId == null ||
        targetVariantId == null ||
        !targetVariantExists
      ) {
        return;
      }

      const focusKey = `${productId}:${targetVariantId}:${targetVariantFocusId}`;

      if (handledTargetVariantFocusRef.current === focusKey) {
        return;
      }

      const variantKey = getInventoryVariantKey(
        inventory?.productId ?? productId,
        targetVariantId,
      );

      void inventoryStore
        .loadVariantMovements(targetVariantId, {
          limit: INVENTORY_MOVEMENTS_PREVIEW_LIMIT,
        })
        .catch(() => undefined);

      const animationFrameId = window.requestAnimationFrame(() => {
        setExpandedVariantKeys((current) => {
          if (current.has(variantKey)) {
            return current;
          }

          const next = new Set(current);
          next.add(variantKey);
          return next;
        });

        variantCardElementByVariantIdRef.current
          .get(targetVariantId)
          ?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        handledTargetVariantFocusRef.current = focusKey;
      });

      return () => {
        window.cancelAnimationFrame(animationFrameId);
      };
    }, [
      inventory?.productId,
      inventoryStore,
      open,
      productId,
      targetVariantExists,
      targetVariantFocusId,
      targetVariantId,
    ]);

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
          .loadVariantMovements(variantId, {
            limit: INVENTORY_MOVEMENTS_PREVIEW_LIMIT,
          })
          .catch(() => undefined);
      }
    };

    const updateVariantStock = (stock: InventoryStock) => {
      setLoadState((current) => {
        if (!current || current.productId !== productId || !current.inventory) {
          return current;
        }

        return {
          ...current,
          inventory: {
            ...current.inventory,
            variants: current.inventory.variants.map((variant) =>
              variant.variantId === stock.variantId
                ? applyInventoryStock(variant, stock)
                : variant,
            ),
          },
        };
      });
    };

    const createInitialStock = async (
      variantId: number,
      values: InitialStockValues,
    ) => {
      const response = await inventoryStore.createInitialStock({
        variantId,
        ...values,
      });

      updateVariantStock(response.stock);
    };

    const createStockPurchase = async (
      variantId: number,
      values: StockPurchaseValues,
    ) => {
      const response = await inventoryStore.createStockPurchase({
        variantId,
        ...values,
      });

      updateVariantStock(response.stock);
    };

    const createStockCorrection = async (
      variantId: number,
      values: StockCorrectionValues,
    ) => {
      const response = await inventoryStore.createStockCorrection({
        variantId,
        ...values,
      });

      updateVariantStock(response.stock);
    };

    const renderVariantCard = (variant: ProductInventoryVariant) => {
      const variantKey = getInventoryVariantKey(
        inventory?.productId ?? productId,
        variant.variantId,
      );

      return (
        <div
          key={variant.variantId}
          ref={(node) => {
            if (node) {
              variantCardElementByVariantIdRef.current.set(
                variant.variantId,
                node,
              );
              return;
            }

            variantCardElementByVariantIdRef.current.delete(variant.variantId);
          }}
        >
          <ProductInventoryVariantCard
            productId={inventory?.productId ?? productId ?? 0}
            productName={productName}
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
            initialStockSubmitting={inventoryStore.isInitialStockSubmitting(
              variant.variantId,
            )}
            initialStockError={inventoryStore.getInitialStockError(
              variant.variantId,
            )}
            stockMovementSubmitting={inventoryStore.isStockMovementSubmitting(
              variant.variantId,
            )}
            stockMovementError={inventoryStore.getStockMovementError(
              variant.variantId,
            )}
            onToggleExpanded={() =>
              toggleVariantExpanded(variantKey, variant.variantId)
            }
            onRetryMovements={() => {
              void inventoryStore
                .loadVariantMovements(variant.variantId, {
                  limit: INVENTORY_MOVEMENTS_PREVIEW_LIMIT,
                  force: true,
                })
                .catch(() => undefined);
            }}
            onCreateInitialStock={(values) =>
              createInitialStock(variant.variantId, values)
            }
            onCreateStockPurchase={(values) =>
              createStockPurchase(variant.variantId, values)
            }
            onCreateStockCorrection={(values) =>
              createStockCorrection(variant.variantId, values)
            }
          />
        </div>
      );
    };

    return (
      <Drawer
        open={open}
        closable={{ placement: "end" }}
        title={
          <Flex vertical gap={4}>
            <Title level={isMobileViewport ? 5 : 4} style={{ margin: 0 }}>
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
        {...drawerLayout}
        destroyOnHidden={true}
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
