import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import {
  findCategoryById,
  flattenCategories,
} from "@/features/categories/model/category-tree";
import { useCategoriesStore } from "@/features/categories/model/use-categories-store";
import { inventoryApi } from "@/features/inventory/api/inventory-api";
import type { CreateStockSupplyItem } from "@/features/inventory/model/inventory.types";
import type { CatalogVariant } from "@/features/products/model/product.types";
import { useNotification } from "@/shared/components/notification/use-notification";

import type {
  StockSupplyModalProps,
  SupplyLine,
  SupplyPickerMode,
} from "../stock-supply-modal.types";
import {
  getVariantSearchText,
  groupVariantsByProduct,
  loadAllCatalogVariants,
} from "../stock-supply-modal.utils";

export const useStockSupplyModal = ({
  onClose,
  onSuccess,
}: Pick<StockSupplyModalProps, "onClose" | "onSuccess">) => {
  const { t } = useTranslation();
  const notification = useNotification();
  const categoriesStore = useCategoriesStore();
  const loadRequestIdRef = useRef(0);
  const [variants, setVariants] = useState<CatalogVariant[]>([]);
  const [variantsLoading, setVariantsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedLines, setSelectedLines] = useState<SupplyLine[]>([]);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [immediatelyApply, setImmediatelyApply] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [pickerMode, setPickerMode] = useState<SupplyPickerMode>("flat");

  const handleAfterOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        loadRequestIdRef.current += 1;
        return;
      }

      const loadRequestId = loadRequestIdRef.current + 1;
      loadRequestIdRef.current = loadRequestId;

      setSelectedLines([]);
      setName("");
      setComment("");
      setImmediatelyApply(false);
      setSearch("");
      setSelectedCategoryId(null);
      setPickerMode("flat");
      setSubmitError(null);
      setVariantsLoading(true);
      setLoadError(null);

      if (categoriesStore.categories.length === 0) {
        void categoriesStore
          .loadCategories({ silent: true })
          .catch(() => undefined);
      }

      void loadAllCatalogVariants()
        .then((nextVariants) => {
          if (loadRequestIdRef.current !== loadRequestId) {
            return;
          }

          setVariants(nextVariants);
        })
        .catch((error) => {
          if (loadRequestIdRef.current !== loadRequestId) {
            return;
          }

          setVariants([]);
          setLoadError(
            getApiErrorMessage(error, t("products.stockSupply.loadError")),
          );
        })
        .finally(() => {
          if (loadRequestIdRef.current === loadRequestId) {
            setVariantsLoading(false);
          }
        });
    },
    [categoriesStore, t],
  );

  const handleClose = useCallback(() => {
    loadRequestIdRef.current += 1;
    onClose();
  }, [onClose]);

  const selectedCategoryIds = useMemo(() => {
    if (selectedCategoryId == null) {
      return null;
    }

    const category = findCategoryById(
      categoriesStore.categories,
      selectedCategoryId,
    );

    if (!category) {
      return new Set([selectedCategoryId]);
    }

    return new Set(flattenCategories([category]).map((item) => item.id));
  }, [categoriesStore.categories, selectedCategoryId]);

  const selectedVariantIds = useMemo(
    () => new Set(selectedLines.map((line) => line.variant.id)),
    [selectedLines],
  );

  const filteredAvailableVariants = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();

    return variants.filter((variant) => {
      if (selectedVariantIds.has(variant.id)) {
        return false;
      }

      if (
        selectedCategoryIds &&
        (variant.product.categoryId == null ||
          !selectedCategoryIds.has(variant.product.categoryId))
      ) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return getVariantSearchText(variant).includes(normalizedSearch);
    });
  }, [search, selectedCategoryIds, selectedVariantIds, variants]);

  const groupedAvailableVariants = useMemo(
    () => groupVariantsByProduct(filteredAvailableVariants),
    [filteredAvailableVariants],
  );

  const selectedQuantity = selectedLines.reduce(
    (sum, line) => sum + (line.quantity ?? 0),
    0,
  );
  const selectedTotal = selectedLines.reduce(
    (sum, line) => sum + (line.quantity ?? 0) * (line.buyPrice ?? 0),
    0,
  );
  const summaryCurrency = selectedLines[0]?.variant.product.currency ?? "UAH";
  const canSubmit =
    name.trim().length > 0 &&
    selectedLines.length > 0 &&
    selectedLines.every(
      (line) =>
        line.quantity != null &&
        line.quantity >= 1 &&
        line.buyPrice != null &&
        line.buyPrice >= 0,
    );

  const addVariant = useCallback((variant: CatalogVariant) => {
    setSelectedLines((current) => {
      if (current.some((line) => line.variant.id === variant.id)) {
        return current;
      }

      return [...current, { variant, quantity: 0, buyPrice: null }];
    });
  }, []);

  const addAllVisibleVariants = useCallback(() => {
    setSelectedLines((current) => {
      const currentVariantIds = new Set(current.map((line) => line.variant.id));
      const nextLines = filteredAvailableVariants
        .filter((variant) => !currentVariantIds.has(variant.id))
        .map((variant) => ({ variant, quantity: 0, buyPrice: null }));

      return [...current, ...nextLines];
    });
  }, [filteredAvailableVariants]);

  const clearSelectedLines = useCallback(() => {
    setSelectedLines([]);
  }, []);

  const removeLine = useCallback((variantId: number) => {
    setSelectedLines((current) =>
      current.filter((line) => line.variant.id !== variantId),
    );
  }, []);

  const updateLine = useCallback(
    (variantId: number, patch: Partial<Omit<SupplyLine, "variant">>) => {
      setSelectedLines((current) =>
        current.map((line) =>
          line.variant.id === variantId ? { ...line, ...patch } : line,
        ),
      );
    },
    [],
  );

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) {
      return;
    }

    const items: CreateStockSupplyItem[] = selectedLines.map((line) => ({
      productId: line.variant.productId,
      productVariantId: line.variant.id,
      quantity: line.quantity ?? 0,
      buyPrice: line.buyPrice ?? 0,
    }));

    setSubmitting(true);
    setSubmitError(null);

    try {
      await inventoryApi.createStockSupply({
        name: name.trim(),
        items,
        comment: comment.trim(),
        immediatelyApply,
      });
      notification.success({ title: t("products.stockSupply.createSuccess") });
      handleClose();
      void Promise.resolve(onSuccess?.()).catch(() => undefined);
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        t("products.stockSupply.createFailed"),
      );
      setSubmitError(message);
      notification.error({ title: message });
    } finally {
      setSubmitting(false);
    }
  }, [
    canSubmit,
    comment,
    handleClose,
    immediatelyApply,
    name,
    notification,
    onSuccess,
    selectedLines,
    t,
  ]);

  const handleCategoryChange = useCallback((categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
  }, []);

  return {
    t,
    categoriesStore,
    variantsLoading,
    loadError,
    submitError,
    submitting,
    selectedLines,
    name,
    comment,
    immediatelyApply,
    search,
    pickerMode,
    selectedCategoryId,
    filteredAvailableVariants,
    groupedAvailableVariants,
    selectedQuantity,
    selectedTotal,
    summaryCurrency,
    canSubmit,
    setName,
    setComment,
    setImmediatelyApply,
    setSearch,
    setPickerMode,
    handleAfterOpenChange,
    handleClose,
    handleSubmit,
    handleCategoryChange,
    addVariant,
    addAllVisibleVariants,
    clearSelectedLines,
    removeLine,
    updateLine,
  };
};
