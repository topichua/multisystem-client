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
  StockSupplySubmitAction,
  SupplyLine,
  SupplyPickerMode,
} from "../stock-supply-modal.types";
import {
  buildSupplyLines,
  getVariantSearchText,
  groupVariantsByProduct,
  loadAllCatalogVariants,
} from "../stock-supply-modal.utils";

export const useStockSupplyModal = ({
  supplyId = null,
  onClose,
  onSuccess,
}: Pick<StockSupplyModalProps, "supplyId" | "onClose" | "onSuccess">) => {
  const { t } = useTranslation();
  const notification = useNotification();
  const categoriesStore = useCategoriesStore();
  const loadRequestIdRef = useRef(0);
  const isEditMode = supplyId != null;
  const [variants, setVariants] = useState<CatalogVariant[]>([]);
  const [variantsLoading, setVariantsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittingAction, setSubmittingAction] =
    useState<StockSupplySubmitAction | null>(null);
  const [selectedLines, setSelectedLines] = useState<SupplyLine[]>([]);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [immediatelyApply, setImmediatelyApply] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [pickerMode, setPickerMode] = useState<SupplyPickerMode>("flat");

  const resetFormState = useCallback(() => {
    setSelectedLines([]);
    setName("");
    setComment("");
    setImmediatelyApply(false);
    setSearch("");
    setSelectedCategoryId(null);
    setPickerMode("flat");
    setSubmitError(null);
  }, []);

  const handleAfterOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        loadRequestIdRef.current += 1;
        setVariantsLoading(true);
        return;
      }

      const loadRequestId = loadRequestIdRef.current + 1;
      loadRequestIdRef.current = loadRequestId;

      resetFormState();
      setVariantsLoading(true);
      setLoadError(null);

      if (categoriesStore.categories.length === 0) {
        void categoriesStore
          .loadCategories({ silent: true })
          .catch(() => undefined);
      }

      const loadVariantsPromise = loadAllCatalogVariants();
      const loadSupplyPromise =
        supplyId != null
          ? inventoryApi.getStockSupply(supplyId)
          : Promise.resolve(null);

      void Promise.all([loadVariantsPromise, loadSupplyPromise])
        .then(([nextVariants, supply]) => {
          if (loadRequestIdRef.current !== loadRequestId) {
            return;
          }

          setVariants(nextVariants);

          if (supply) {
            setName(supply.name);
            setComment(supply.comment ?? "");
            setSelectedLines(buildSupplyLines(supply, nextVariants));
          }
        })
        .catch((error) => {
          if (loadRequestIdRef.current !== loadRequestId) {
            return;
          }

          setVariants([]);
          setSelectedLines([]);
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
    [categoriesStore, resetFormState, supplyId, t],
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
  const submitting = submittingAction != null;

  const buildItemsPayload = useCallback(
    (): CreateStockSupplyItem[] =>
      selectedLines.map((line) => ({
        productId: line.variant.productId,
        productVariantId: line.variant.id,
        quantity: line.quantity ?? 0,
        buyPrice: line.buyPrice ?? 0,
      })),
    [selectedLines],
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

  const finishSuccessfully = useCallback(
    (successKey: string) => {
      notification.success({ title: t(successKey) });
      handleClose();
      void Promise.resolve(onSuccess?.()).catch(() => undefined);
    },
    [handleClose, notification, onSuccess, t],
  );

  const persistSupplyDraft = useCallback(async () => {
    if (supplyId == null) {
      return;
    }

    await inventoryApi.updateStockSupply(supplyId, {
      name: name.trim(),
      items: buildItemsPayload(),
      comment: comment.trim(),
    });
  }, [buildItemsPayload, comment, name, supplyId]);

  const runAction = useCallback(
    async (
      action: StockSupplySubmitAction,
      failedKey: string,
      execute: () => Promise<void>,
      onSuccessAction?: () => void,
    ) => {
      setSubmittingAction(action);
      setSubmitError(null);

      try {
        await execute();
        onSuccessAction?.();
      } catch (error) {
        const message = getApiErrorMessage(error, t(failedKey));
        setSubmitError(message);
        notification.error({ title: message });
      } finally {
        setSubmittingAction(null);
      }
    },
    [notification, t],
  );

  const handleCreate = useCallback(async () => {
    if (!canSubmit) {
      return;
    }

    await runAction(
      "create",
      "products.stockSupply.createFailed",
      async () => {
        await inventoryApi.createStockSupply({
          name: name.trim(),
          items: buildItemsPayload(),
          comment: comment.trim(),
          immediatelyApply,
        });
      },
      () => finishSuccessfully("products.stockSupply.createSuccess"),
    );
  }, [
    buildItemsPayload,
    canSubmit,
    comment,
    finishSuccessfully,
    immediatelyApply,
    name,
    runAction,
  ]);

  const handleSave = useCallback(async () => {
    if (!canSubmit || supplyId == null) {
      return;
    }

    await runAction(
      "save",
      "products.stockSupply.saveFailed",
      persistSupplyDraft,
      () => {
        notification.success({
          title: t("products.stockSupply.saveSuccess"),
        });
        void Promise.resolve(onSuccess?.()).catch(() => undefined);
      },
    );
  }, [
    canSubmit,
    notification,
    onSuccess,
    persistSupplyDraft,
    runAction,
    supplyId,
    t,
  ]);

  const handleApply = useCallback(async () => {
    if (!canSubmit || supplyId == null) {
      return;
    }

    await runAction(
      "apply",
      "products.stockSupply.applyFailed",
      async () => {
        await persistSupplyDraft();
        await inventoryApi.applyStockSupply(supplyId);
      },
      () => finishSuccessfully("products.stockSupply.applySuccess"),
    );
  }, [canSubmit, finishSuccessfully, persistSupplyDraft, runAction, supplyId]);

  const handleDelete = useCallback(async () => {
    if (supplyId == null) {
      return;
    }

    await runAction(
      "delete",
      "products.stockSupply.deleteFailed",
      async () => {
        await inventoryApi.deleteStockSupply(supplyId);
      },
      () => finishSuccessfully("products.stockSupply.deleteSuccess"),
    );
  }, [finishSuccessfully, runAction, supplyId]);

  const handleCategoryChange = useCallback((categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
  }, []);

  return {
    t,
    isEditMode,
    categoriesStore,
    variantsLoading,
    loadError,
    submitError,
    submitting,
    submittingAction,
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
    handleCreate,
    handleSave,
    handleApply,
    handleDelete,
    handleCategoryChange,
    addVariant,
    addAllVisibleVariants,
    clearSelectedLines,
    removeLine,
    updateLine,
  };
};
