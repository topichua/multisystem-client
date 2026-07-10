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
import {
  calculateOrderDiscountAmount,
  normalizeOrderDiscountPercent,
} from "@/features/orders/utils/order-discount";
import type { CatalogVariant } from "@/features/products/model/product.types";
import { useCatalogProductSearch } from "@/features/products/components/catalog-product-search";
import { useNotification } from "@/shared/components/notification/use-notification";
import { normalizeClientPhoneForInput } from "@/utils/phone-input";

import { useClientOrderNovaPoshtaDelivery } from "./use-client-order-nova-poshta-delivery";

export type {
  CategorySelectOptionData,
  VariantSelectOption,
  VariantSelectOptionData,
} from "@/features/products/components/catalog-product-search";

const DEFAULT_CASH_ON_DELIVERY_AMOUNT = 110;

type UseClientOrderCreateControllerParams = {
  conversationId: number;
  linkedClient: Client;
  onClose: () => void;
  onOrderCreated?: () => void;
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
  const [orderLines, setOrderLines] = useState<OrderDraftLine[]>([]);
  const catalogSearch = useCatalogProductSearch({ loadCategories: true });
  const withoutDelivery = Form.useWatch("withoutDelivery", form) === true;
  const isCashOnDelivery = Form.useWatch("isCashOnDelivery", form);
  const cashOnDeliveryAmount = Form.useWatch("cashOnDeliveryAmount", form);
  const discountPercent = Form.useWatch("discountPercent", form);

  const initialFormValues = useMemo<OrderFormValues>(
    () => ({
      firstName: linkedClient.firstName,
      lastName: linkedClient.lastName,
      phone: normalizeClientPhoneForInput(linkedClient.phone),
      deliveryMethod: "nova_poshta",
      deliveryType: "warehouse",
      isCashOnDelivery: true,
      cashOnDeliveryAmount: DEFAULT_CASH_ON_DELIVERY_AMOUNT,
      withoutDelivery: false,
      discountPercent: 0,
    }),
    [linkedClient.firstName, linkedClient.lastName, linkedClient.phone],
  );

  useEffect(() => {
    form.setFieldsValue(initialFormValues);
  }, [form, initialFormValues]);

  const novaPoshtaDelivery = useClientOrderNovaPoshtaDelivery({ form });
  const clearNovaPoshtaSelects = novaPoshtaDelivery.clearSelects;

  const orderTotals = useMemo(() => {
    const productCount = orderLines.reduce(
      (sum, line) => sum + line.quantity,
      0,
    );
    const productsTotal = orderLines.reduce(
      (sum, line) => sum + line.quantity * line.variant.unitPrice,
      0,
    );
    const currency =
      orderLines[0]?.variant.product.currency?.toLowerCase() ?? "uah";
    const hasCashOnDelivery = !withoutDelivery && isCashOnDelivery !== false;
    const deliveryAmount = hasCashOnDelivery
      ? Number(cashOnDeliveryAmount) || 0
      : 0;
    const normalizedDiscountPercent =
      normalizeOrderDiscountPercent(discountPercent);
    const discountAmount = calculateOrderDiscountAmount(
      productsTotal,
      normalizedDiscountPercent,
    );

    return {
      productCount,
      productsTotal,
      deliveryAmount,
      discountAmount,
      discountPercent: normalizedDiscountPercent,
      hasCashOnDelivery,
      total: productsTotal - discountAmount + deliveryAmount,
      currency,
    };
  }, [
    cashOnDeliveryAmount,
    discountPercent,
    isCashOnDelivery,
    orderLines,
    withoutDelivery,
  ]);

  useEffect(() => {
    if (withoutDelivery) {
      return;
    }
    if (isCashOnDelivery === false) {
      return;
    }
    const cashOnDeliveryAmount = form.getFieldValue("cashOnDeliveryAmount");
    if (cashOnDeliveryAmount !== undefined && cashOnDeliveryAmount !== null) {
      return;
    }

    form.setFieldValue("cashOnDeliveryAmount", DEFAULT_CASH_ON_DELIVERY_AMOUNT);
  }, [form, isCashOnDelivery, withoutDelivery]);

  const addVariantToOrder = useCallback((variant: CatalogVariant) => {
    if (!variant.inStock) {
      return;
    }

    setOrderLines((prev) => {
      const existing = prev.find((line) => line.variantId === variant.id);
      if (existing) {
        return prev;
      }

      return [...prev, { variantId: variant.id, quantity: 1, variant }];
    });
  }, []);

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
    catalogSearch.reset();
    clearNovaPoshtaSelects();
    setOrderLines([]);
    form.resetFields();
    form.setFieldsValue(initialFormValues);
  }, [catalogSearch, clearNovaPoshtaSelects, form, initialFormValues]);

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

  const handleWithoutDeliveryChange = useCallback(
    (checked: boolean) => {
      form.setFieldValue("withoutDelivery", checked);

      if (checked) {
        clearNovaPoshtaSelects();
      }
    },
    [clearNovaPoshtaSelects, form],
  );

  const selectedVariantIds = useMemo(
    () => new Set(orderLines.map((line) => line.variantId)),
    [orderLines],
  );

  return {
    catalogSearch,
    createLoading: ordersStore.createLoading,
    form,
    orderLines,
    orderTotals,
    novaPoshtaDelivery,
    selectedVariantIds,
    withoutDelivery,
    addVariantToOrder,
    handleDrawerClose,
    handlePlaceOrder,
    handleWithoutDeliveryChange,
    removeLine,
    updateLineQuantity,
  };
}
