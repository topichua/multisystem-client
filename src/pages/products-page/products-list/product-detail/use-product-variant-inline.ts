import { message } from "antd";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import type {
  ProductDetails,
  ProductVariantCreatePayload,
  ProductVariantDraft,
  ProductVariantUpdatePayload,
} from "@/features/products/model/product.types";

import {
  createEmptyVariantDraft,
  createVariantDraftClientId,
  draftToCreatePayload,
  draftToUpdatePayload,
  isVariantDraftValid,
  parseVariantRowKey,
  variantRowKey,
  variantToDraft,
} from "./variant-draft-utils";

type VariantPersistOptions = {
  silent?: boolean;
};

type InlineDraftState = {
  productId: number | null;
  pendingRows: ProductVariantDraft[];
  rowEdits: Record<string, ProductVariantDraft>;
  editingIds: Set<string>;
};

const createEmptyInlineDraftState = (
  productId: number | null,
): InlineDraftState => ({
  productId,
  pendingRows: [],
  rowEdits: {},
  editingIds: new Set(),
});

type UseProductVariantInlineParams = {
  product: ProductDetails | null;
  onCreateVariant: (
    payload: ProductVariantCreatePayload,
    imageFile?: File | null,
    options?: VariantPersistOptions,
  ) => Promise<void>;
  onUpdateVariant: (
    variantId: number,
    payload: ProductVariantUpdatePayload,
    imageFile?: File | null,
    options?: VariantPersistOptions,
  ) => Promise<void>;
  onDeleteVariant: (variantId: number) => Promise<void>;
  variantSaveOptions?: VariantPersistOptions;
};

export const useProductVariantInline = ({
  product,
  onCreateVariant,
  onUpdateVariant,
  onDeleteVariant,
  variantSaveOptions,
}: UseProductVariantInlineParams) => {
  const { t } = useTranslation();
  const productId = product?.id ?? null;
  const [draftState, setDraftState] = useState(() =>
    createEmptyInlineDraftState(productId),
  );

  if (productId !== draftState.productId) {
    setDraftState(createEmptyInlineDraftState(productId));
  }

  const { pendingRows, rowEdits, editingIds } = draftState;
  const variants = useMemo(() => product?.variants ?? [], [product?.variants]);

  const isRowEditing = useCallback(
    (clientId: string) => editingIds.has(clientId),
    [editingIds],
  );

  const markEditing = useCallback((clientId: string) => {
    setDraftState((prev) => {
      const next = new Set(prev.editingIds);
      next.add(clientId);
      return { ...prev, editingIds: next };
    });
  }, []);

  const markSaved = useCallback((clientId: string) => {
    setDraftState((prev) => {
      const next = new Set(prev.editingIds);
      next.delete(clientId);
      return { ...prev, editingIds: next };
    });
  }, []);

  const tableRows = useMemo(() => {
    const persisted = variants.map((variant) => {
      const clientId = variantRowKey(variant.id);
      if (isRowEditing(clientId) && rowEdits[clientId]) {
        return rowEdits[clientId];
      }
      return variantToDraft(variant);
    });

    return [...persisted, ...pendingRows];
  }, [isRowEditing, pendingRows, rowEdits, variants]);

  const findRow = useCallback(
    (clientId: string): ProductVariantDraft | undefined => {
      const fromTable = tableRows.find((row) => row.clientId === clientId);
      if (fromTable) {
        return fromTable;
      }
      return (
        rowEdits[clientId] ??
        pendingRows.find((row) => row.clientId === clientId)
      );
    },
    [pendingRows, rowEdits, tableRows],
  );

  const openVariantCreate = useCallback(() => {
    const clientId = createVariantDraftClientId();
    const row = createEmptyVariantDraft(clientId);
    setDraftState((prev) => ({
      ...prev,
      pendingRows: [...prev.pendingRows, row],
    }));
    markEditing(clientId);
  }, [markEditing]);

  const updateDraft = useCallback(
    (clientId: string, patch: Partial<ProductVariantDraft>) => {
      const persistedId = parseVariantRowKey(clientId);

      if (persistedId != null) {
        setDraftState((prev) => {
          const current =
            prev.rowEdits[clientId] ??
            (() => {
              const variant = variants.find((row) => row.id === persistedId);
              return variant ? variantToDraft(variant) : null;
            })();

          if (!current) {
            return prev;
          }

          return {
            ...prev,
            rowEdits: {
              ...prev.rowEdits,
              [clientId]: { ...current, ...patch },
            },
          };
        });
        return;
      }

      setDraftState((prev) => ({
        ...prev,
        pendingRows: prev.pendingRows.map((row) =>
          row.clientId === clientId ? { ...row, ...patch } : row,
        ),
      }));
    },
    [variants],
  );

  const startEditDraft = useCallback(
    (clientId: string) => {
      const persistedId = parseVariantRowKey(clientId);
      if (persistedId != null) {
        const variant = variants.find((row) => row.id === persistedId);
        if (variant) {
          setDraftState((prev) => ({
            ...prev,
            rowEdits: { ...prev.rowEdits, [clientId]: variantToDraft(variant) },
          }));
        }
      }
      markEditing(clientId);
    },
    [markEditing, variants],
  );

  const saveDraft = useCallback(
    async (clientId: string) => {
      const row = findRow(clientId);
      if (!row || !isVariantDraftValid(row)) {
        message.error(t("products.form.required"));
        return;
      }

      const persistedId = parseVariantRowKey(clientId);
      const imageFile = row.imageFile ?? null;

      try {
        if (persistedId != null) {
          await onUpdateVariant(
            persistedId,
            draftToUpdatePayload(row),
            imageFile,
            variantSaveOptions,
          );
        } else {
          await onCreateVariant(
            draftToCreatePayload(row),
            imageFile,
            variantSaveOptions,
          );
          setDraftState((prev) => ({
            ...prev,
            pendingRows: prev.pendingRows.filter(
              (draft) => draft.clientId !== clientId,
            ),
          }));
        }

        setDraftState((prev) => {
          const nextRowEdits = { ...prev.rowEdits };
          delete nextRowEdits[clientId];
          return { ...prev, rowEdits: nextRowEdits };
        });
        markSaved(clientId);
      } catch {
        // Errors are surfaced by the parent handlers.
      }
    },
    [
      findRow,
      markSaved,
      onCreateVariant,
      onUpdateVariant,
      t,
      variantSaveOptions,
    ],
  );

  const deleteDraft = useCallback(
    async (clientId: string) => {
      const persistedId = parseVariantRowKey(clientId);

      if (persistedId != null) {
        await onDeleteVariant(persistedId);
      } else {
        setDraftState((prev) => ({
          ...prev,
          pendingRows: prev.pendingRows.filter(
            (draft) => draft.clientId !== clientId,
          ),
        }));
      }

      setDraftState((prev) => {
        const nextRowEdits = { ...prev.rowEdits };
        delete nextRowEdits[clientId];
        return { ...prev, rowEdits: nextRowEdits };
      });
      markSaved(clientId);
    },
    [markSaved, onDeleteVariant],
  );

  const hasEditingRows = editingIds.size > 0;

  return {
    tableRows,
    hasEditingRows,
    isRowEditing,
    openVariantCreate,
    updateDraft,
    saveDraft,
    startEditDraft,
    deleteDraft,
  };
};
