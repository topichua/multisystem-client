import { Form } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import type { OrderUpdatePayload } from "@/features/orders/model/order.types";
import { useOrdersStore } from "@/features/orders/model/use-orders-store";
import type { CatalogVariant } from "@/features/products/model/product.types";
import {
  MIN_PRODUCT_SEARCH_LENGTH,
  PRODUCT_SEARCH_DEBOUNCE_MS,
} from "@/pages/orders-page/orders-new/orders-new.constants";
import { useNotification } from "@/shared/components/notification/use-notification";

import type {
  EditableOrderLine,
  OrderEditFormValues,
  OrderEditModalSessionProps,
} from "../order-edit-modal.types";
import {
  assignExclusiveDiscount,
  buildItemPayload,
  buildLineFromVariant,
  buildOrderEditInitialFormValues,
  buildOrderEditLines,
  getDiscountType,
  isLinePatchable,
  normalizeTextField,
} from "../utils/order-edit-modal.utils";

export const useOrderEditModal = ({
  order,
  mode,
  onClose,
  onUpdateOrder,
}: OrderEditModalSessionProps) => {
  const { t } = useTranslation();
  const notification = useNotification();
  const ordersStore = useOrdersStore();
  const [form] = Form.useForm<OrderEditFormValues>();
  const [saving, setSaving] = useState(false);
  const [lines, setLines] = useState(() => buildOrderEditLines(order));
  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const [productSearchValue, setProductSearchValue] = useState("");
  const trimmedProductSearch = productSearchValue.trim();
  const canEditItems = order.status?.category === "new";
  const editItemsAllowed = mode === "items" && canEditItems;
  const hasUnpatchableLines = lines.some((line) => !isLinePatchable(line));
  const initialFormValues = useMemo(
    () => buildOrderEditInitialFormValues(order),
    [order],
  );

  const selectedVariantIds = useMemo(
    () =>
      new Set(
        lines
          .map((line) => line.variantId)
          .filter((variantId): variantId is number => variantId != null),
      ),
    [lines],
  );
  const originalOrderDiscountType = useMemo(
    () => getDiscountType(order.discountAmount, order.discountPercent),
    [order.discountAmount, order.discountPercent],
  );

  useEffect(() => {
    ordersStore.clearCatalogSearch();

    return () => {
      ordersStore.clearCatalogSearch();
    };
  }, [ordersStore]);

  useEffect(() => {
    if (!productSearchOpen || !editItemsAllowed) {
      return;
    }

    if (trimmedProductSearch.length < MIN_PRODUCT_SEARCH_LENGTH) {
      ordersStore.clearCatalogSearch();
      return;
    }

    const timer = window.setTimeout(() => {
      void ordersStore
        .searchCatalog({
          keyword: trimmedProductSearch,
          categoryId: null,
          mode: "flat",
        })
        .catch(() => undefined);
    }, PRODUCT_SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [
    editItemsAllowed,
    ordersStore,
    productSearchOpen,
    trimmedProductSearch,
  ]);

  const handleProductSearchOpen = useCallback(() => {
    setProductSearchOpen(true);
  }, []);

  const handleProductSearchClose = useCallback(() => {
    setProductSearchOpen(false);
    setProductSearchValue("");
    ordersStore.clearCatalogSearch();
  }, [ordersStore]);

  const handleVariantSelect = useCallback(
    (variant: CatalogVariant) => {
      if (!variant.inStock || selectedVariantIds.has(variant.id)) {
        return;
      }

      setLines((current) => [...current, buildLineFromVariant(variant)]);
    },
    [selectedVariantIds],
  );

  const updateLine = useCallback(
    (lineKey: string, patch: Partial<EditableOrderLine>) => {
      setLines((current) =>
        current.map((line) =>
          line.key === lineKey ? { ...line, ...patch } : line,
        ),
      );
    },
    [],
  );

  const removeLine = useCallback((lineKey: string) => {
    setLines((current) => current.filter((line) => line.key !== lineKey));
  }, []);

  const handleCancel = useCallback(() => {
    if (saving) {
      return;
    }

    onClose();
  }, [onClose, saving]);

  const handleSave = useCallback(async () => {
    const values = await form.validateFields();
    const payload: OrderUpdatePayload = {
      customerNote: normalizeTextField(values.customerNote),
      internalNote: normalizeTextField(values.internalNote),
    };

    if (editItemsAllowed) {
      if (lines.length === 0) {
        notification.error({
          title: t("orders.details.editItemsRequired"),
        });
        return;
      }

      if (hasUnpatchableLines) {
        notification.error({
          title: t("orders.details.editItemsMissingRefs"),
        });
        return;
      }

      payload.items = lines.filter(isLinePatchable).map(buildItemPayload);
      assignExclusiveDiscount(
        payload,
        values.discountAmount,
        values.discountPercent,
        originalOrderDiscountType,
      );
    }

    setSaving(true);

    try {
      await onUpdateOrder(payload);
      notification.success({
        title: t("orders.details.editSuccess"),
      });
      onClose();
    } catch (error) {
      notification.error({
        title: getApiErrorMessage(error, t("orders.details.editFailed")),
      });
    } finally {
      setSaving(false);
    }
  }, [
    editItemsAllowed,
    form,
    hasUnpatchableLines,
    lines,
    notification,
    onClose,
    onUpdateOrder,
    originalOrderDiscountType,
    t,
  ]);

  const modalTitle =
    editItemsAllowed || mode === "items"
      ? t("orders.details.editOrderTitle")
      : t("orders.details.editNotesTitle");

  return {
    t,
    form,
    saving,
    lines,
    productSearchOpen,
    productSearchValue,
    trimmedProductSearch,
    canEditItems,
    editItemsAllowed,
    hasUnpatchableLines,
    selectedVariantIds,
    initialFormValues,
    catalogSearchLoading: ordersStore.catalogSearchLoading,
    catalogSearchResults: ordersStore.catalogSearchResults,
    modalTitle,
    setProductSearchValue,
    handleProductSearchOpen,
    handleProductSearchClose,
    handleVariantSelect,
    updateLine,
    removeLine,
    handleCancel,
    handleSave,
  };
};
