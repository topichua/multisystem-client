import { Form } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import type { Client } from "@/features/clients/model/client.types";
import type {
  OrderDraftLine,
  OrderFormValues,
} from "@/features/orders/model/order.types";
import { useOrdersStore } from "@/features/orders/model/use-orders-store";
import type { CatalogVariant } from "@/features/products/model/product.types";
import { useNotification } from "@/shared/components/notification/use-notification";

const MIN_SEARCH_LENGTH = 3;
const SEARCH_DEBOUNCE_MS = 300;

type UseClientOrderCreateControllerParams = {
  conversationId: number;
  linkedClient: Client;
  onClose: () => void;
  onOrderCreated?: () => void;
};

export type VariantSelectOptionData = {
  variant: CatalogVariant;
};

export function useClientOrderCreateController({
  conversationId,
  linkedClient,
  onClose,
  onOrderCreated,
}: UseClientOrderCreateControllerParams) {
  const { t } = useTranslation();
  const ordersStore = useOrdersStore();
  const notification = useNotification();
  const [form] = Form.useForm<OrderFormValues>();
  const [searchQuery, setSearchQuery] = useState("");
  const [productPickerKey, setProductPickerKey] = useState(0);
  const [orderLines, setOrderLines] = useState<OrderDraftLine[]>([]);
  const trimmedSearch = searchQuery.trim();

  useEffect(() => {
    if (trimmedSearch.length < MIN_SEARCH_LENGTH) {
      ordersStore.clearCatalogSearch();
      return;
    }

    const timer = window.setTimeout(() => {
      void ordersStore.searchCatalogVariants(trimmedSearch);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [trimmedSearch, ordersStore]);

  const orderTotals = useMemo(() => {
    const productCount = orderLines.reduce(
      (sum, line) => sum + line.quantity,
      0,
    );
    const total = orderLines.reduce(
      (sum, line) => sum + line.quantity * line.variant.unitPrice,
      0,
    );
    const currency =
      orderLines[0]?.variant.product.currency?.toLowerCase() ?? "uah";

    return { productCount, total, currency };
  }, [orderLines]);

  const variantSelectOptions = useMemo(
    () =>
      ordersStore.catalogSearchResults.map((variant) => ({
        value: variant.id,
        label: variant.label,
        variant,
      })),
    [ordersStore.catalogSearchResults],
  );

  const variantsById = useMemo(
    () =>
      new Map(
        ordersStore.catalogSearchResults.map((variant) => [
          variant.id,
          variant,
        ]),
      ),
    [ordersStore.catalogSearchResults],
  );

  const addVariantToOrder = useCallback(
    (variant: CatalogVariant) => {
      setOrderLines((prev) => {
        const existing = prev.find((line) => line.variantId === variant.id);
        if (existing) {
          const maxQty =
            variant.quantity > 0 ? variant.quantity : Number.MAX_SAFE_INTEGER;
          const nextQuantity = Math.min(existing.quantity + 1, maxQty);
          return prev.map((line) =>
            line.variantId === variant.id
              ? { ...line, quantity: nextQuantity, variant }
              : line,
          );
        }

        return [...prev, { variantId: variant.id, quantity: 1, variant }];
      });
      setSearchQuery("");
      ordersStore.clearCatalogSearch();
      setProductPickerKey((key) => key + 1);
    },
    [ordersStore],
  );

  const updateLineQuantity = useCallback(
    (variantId: number, quantity: number) => {
      setOrderLines((prev) =>
        prev.map((line) =>
          line.variantId === variantId ? { ...line, quantity } : line,
        ),
      );
    },
    [],
  );

  const removeLine = useCallback((variantId: number) => {
    setOrderLines((prev) =>
      prev.filter((line) => line.variantId !== variantId),
    );
  }, []);

  const resetDrawerState = useCallback(() => {
    setSearchQuery("");
    ordersStore.clearCatalogSearch();
    setProductPickerKey(0);
    setOrderLines([]);
    form.resetFields();
  }, [form, ordersStore]);

  const handleDrawerClose = useCallback(() => {
    resetDrawerState();
    onClose();
  }, [onClose, resetDrawerState]);

  const handlePlaceOrder = useCallback(async () => {
    if (orderLines.length === 0) {
      return;
    }

    let formValues: OrderFormValues;
    try {
      formValues = await form.validateFields();
    } catch {
      return;
    }

    try {
      await ordersStore.createOrder({
        linkedClient,
        conversationId,
        orderLines,
        formValues,
      });
      notification.success({
        title: t("conversation.clientOrders.placeOrderSuccess"),
      });
      resetDrawerState();
      onOrderCreated?.();
      onClose();
    } catch (error) {
      notification.error({
        title: getApiErrorMessage(
          error,
          t("conversation.clientOrders.placeOrderFailed"),
        ),
      });
    }
  }, [
    conversationId,
    form,
    linkedClient,
    notification,
    onClose,
    onOrderCreated,
    orderLines,
    ordersStore,
    resetDrawerState,
    t,
  ]);

  const handleVariantSelect = useCallback(
    (variantId: number) => {
      const variant = variantsById.get(variantId);
      if (variant) {
        addVariantToOrder(variant);
      }
    },
    [addVariantToOrder, variantsById],
  );

  const handleCatalogSearch = useCallback(
    (value: string) => {
      setSearchQuery(value);
      if (value.trim().length < MIN_SEARCH_LENGTH) {
        ordersStore.clearCatalogSearch();
      }
    },
    [ordersStore],
  );

  const deliveryMethodOptions = useMemo(
    () => [
      {
        value: "nova_poshta",
        label: t("conversation.clientOrders.drawer.deliveryNovaPoshta"),
      },
    ],
    [t],
  );

  const billingMethodOptions = useMemo(
    () => [
      {
        value: "cash",
        label: t("conversation.clientOrders.drawer.billingCash"),
      },
      {
        value: "card",
        label: t("conversation.clientOrders.drawer.billingCard"),
      },
    ],
    [t],
  );

  return {
    catalogSearchLoading: ordersStore.catalogSearchLoading,
    createLoading: ordersStore.createLoading,
    form,
    orderLines,
    orderTotals,
    productPickerKey,
    trimmedSearch,
    variantSelectOptions,
    deliveryMethodOptions,
    billingMethodOptions,
    minSearchLength: MIN_SEARCH_LENGTH,
    handleCatalogSearch,
    handleDrawerClose,
    handlePlaceOrder,
    handleVariantSelect,
    removeLine,
    setSearchQuery,
    updateLineQuantity,
  };
}
