import { Form } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import type { OrderUpdatePayload } from "@/features/orders/model/order.types";
import { useOrdersStore } from "@/features/orders/model/use-orders-store";
import type { CatalogVariant } from "@/features/products/model/product.types";
import { useCatalogProductSearch } from "@/features/products/components/catalog-product-search";
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
  const canEditItems = order.status?.category === "new";
  const editItemsAllowed = mode === "items" && canEditItems;
  const catalogSearch = useCatalogProductSearch({
    enabled: productSearchOpen && editItemsAllowed,
    loadCategories: true,
  });
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

  const handleProductSearchClose = useCallback(() => {
    setProductSearchOpen(false);
    catalogSearch.reset();
  }, [catalogSearch]);

  const handleProductSearchOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        setProductSearchOpen(true);
        return;
      }

      handleProductSearchClose();
    },
    [handleProductSearchClose],
  );

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
    canEditItems,
    editItemsAllowed,
    hasUnpatchableLines,
    selectedVariantIds,
    initialFormValues,
    catalogSearch,
    modalTitle,
    handleProductSearchOpenChange,
    handleVariantSelect,
    updateLine,
    removeLine,
    handleCancel,
    handleSave,
  };
};
