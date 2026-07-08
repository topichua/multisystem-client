import { Form } from "antd";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import type { Category } from "@/features/categories/model/category.types";
import { useCategoriesStore } from "@/features/categories/model/use-categories-store";
import type { Client } from "@/features/clients/model/client.types";
import type {
  OrderDraftLine,
  OrderFormValues,
} from "@/features/orders/model/order.types";
import type { CatalogSearchMode } from "@/features/orders/model/orders-store";
import { useOrdersStore } from "@/features/orders/model/use-orders-store";
import {
  calculateOrderDiscountAmount,
  normalizeOrderDiscountPercent,
} from "@/features/orders/utils/order-discount";
import type { CatalogVariant } from "@/features/products/model/product.types";
import { useNotification } from "@/shared/components/notification/use-notification";
import { normalizeClientPhoneForInput } from "@/utils/phone-input";

import { useClientOrderNovaPoshtaDelivery } from "./use-client-order-nova-poshta-delivery";

const MIN_SEARCH_LENGTH = 3;
const SEARCH_DEBOUNCE_MS = 300;
const DEFAULT_CASH_ON_DELIVERY_AMOUNT = 110;

export type CategorySelectOptionData = {
  value: number;
  label: string;
  level: number;
};

export type VariantSelectOptionData = {
  variant: CatalogVariant;
};

export type VariantSelectOption = {
  label: string;
  value: number;
  variant: CatalogVariant;
};

type UseClientOrderCreateControllerParams = {
  conversationId: number;
  linkedClient: Client;
  onClose: () => void;
  onOrderCreated?: () => void;
};

const flattenCategoriesForSelect = (
  categories: Category[],
  level = 0,
): CategorySelectOptionData[] =>
  categories.flatMap((category) => [
    { value: category.id, label: category.name, level },
    ...flattenCategoriesForSelect(category.children ?? [], level + 1),
  ]);

export function useClientOrderCreateController({
  conversationId,
  linkedClient,
  onClose,
  onOrderCreated,
}: UseClientOrderCreateControllerParams) {
  const { t } = useTranslation();
  const ordersStore = useOrdersStore();
  const categoriesStore = useCategoriesStore();
  const notification = useNotification();
  const [form] = Form.useForm<OrderFormValues>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [catalogSearchMode, setCatalogSearchMode] =
    useState<CatalogSearchMode>("flat");
  const [productPickerKey, setProductPickerKey] = useState(0);
  const [orderLines, setOrderLines] = useState<OrderDraftLine[]>([]);
  const categoryLoadRequestedRef = useRef(false);
  const trimmedSearch = searchQuery.trim();
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

  useEffect(() => {
    if (
      categoryLoadRequestedRef.current ||
      categoriesStore.categories.length > 0
    ) {
      return;
    }

    categoryLoadRequestedRef.current = true;
    void categoriesStore.loadCategories().catch(() => undefined);
  }, [categoriesStore, categoriesStore.categories.length]);

  useEffect(() => {
    if (trimmedSearch.length < MIN_SEARCH_LENGTH) {
      ordersStore.clearCatalogSearch();
      return;
    }

    const timer = window.setTimeout(() => {
      void ordersStore
        .searchCatalog({
          keyword: trimmedSearch,
          categoryId: selectedCategoryId,
          mode: catalogSearchMode,
        })
        .catch(() => undefined);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [catalogSearchMode, ordersStore, selectedCategoryId, trimmedSearch]);

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

  const categorySelectOptions = useMemo(
    () => flattenCategoriesForSelect(categoriesStore.categories),
    [categoriesStore.categories],
  );

  const variantSelectOptions = useMemo<VariantSelectOption[]>(
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

  const addVariantToOrder = useCallback((variant: CatalogVariant) => {
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
    setSearchQuery("");
    setSelectedCategoryId(null);
    setCatalogSearchMode("flat");
    ordersStore.clearCatalogSearch();
    clearNovaPoshtaSelects();
    setProductPickerKey(0);
    setOrderLines([]);
    form.resetFields();
    form.setFieldsValue(initialFormValues);
  }, [clearNovaPoshtaSelects, form, initialFormValues, ordersStore]);

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
      if (variant?.inStock) {
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

  const handleCatalogSearchClear = useCallback(() => {
    setSearchQuery("");
    ordersStore.clearCatalogSearch();
  }, [ordersStore]);

  const handleCategoryChange = useCallback((categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
  }, []);

  const handleCatalogSearchModeChange = useCallback(
    (mode: CatalogSearchMode) => {
      setCatalogSearchMode(mode);
    },
    [],
  );

  const handleWithoutDeliveryChange = useCallback(
    (checked: boolean) => {
      form.setFieldValue("withoutDelivery", checked);

      if (checked) {
        clearNovaPoshtaSelects();
      }
    },
    [clearNovaPoshtaSelects, form],
  );

  return {
    catalogSearchProductGroups: ordersStore.catalogSearchProductGroups,
    categoriesLoading: categoriesStore.listLoading,
    categorySelectOptions,
    catalogSearchLoading: ordersStore.catalogSearchLoading,
    catalogSearchMode,
    createLoading: ordersStore.createLoading,
    form,
    orderLines,
    orderTotals,
    novaPoshtaDelivery,
    productPickerKey,
    selectedCategoryId,
    trimmedSearch,
    variantSelectOptions,
    withoutDelivery,
    minSearchLength: MIN_SEARCH_LENGTH,
    handleCatalogSearchClear,
    handleCatalogSearchModeChange,
    handleCategoryChange,
    handleCatalogSearch,
    handleDrawerClose,
    handlePlaceOrder,
    handleVariantSelect,
    handleWithoutDeliveryChange,
    removeLine,
    updateLineQuantity,
  };
}
