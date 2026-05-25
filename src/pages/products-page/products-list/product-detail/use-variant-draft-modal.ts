import { message } from 'antd';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { ProductVariantDraft } from '@/features/products/model/product.types';

import {
  createEmptyVariantDraft,
  createVariantDraftClientId,
  isVariantDraftValid,
} from './variant-draft-utils';

export const useVariantDraftModal = () => {
  const { t } = useTranslation();
  const [drafts, setDrafts] = useState<ProductVariantDraft[]>([]);
  const [editingIds, setEditingIds] = useState<Set<string>>(() => new Set());

  const isRowEditing = useCallback((clientId: string) => editingIds.has(clientId), [editingIds]);

  const markEditing = useCallback((clientId: string) => {
    setEditingIds((prev) => {
      const next = new Set(prev);
      next.add(clientId);
      return next;
    });
  }, []);

  const markSaved = useCallback((clientId: string) => {
    setEditingIds((prev) => {
      const next = new Set(prev);
      next.delete(clientId);
      return next;
    });
  }, []);

  const resetDrafts = useCallback(() => {
    setDrafts([]);
    setEditingIds(new Set());
  }, []);

  const openVariantCreate = useCallback(() => {
    const clientId = createVariantDraftClientId();
    setDrafts((prev) => [...prev, createEmptyVariantDraft(clientId)]);
    markEditing(clientId);
  }, [markEditing]);

  const updateDraft = useCallback((clientId: string, patch: Partial<ProductVariantDraft>) => {
    setDrafts((prev) =>
      prev.map((draft) => (draft.clientId === clientId ? { ...draft, ...patch } : draft)),
    );
  }, []);

  const saveDraft = useCallback(
    (clientId: string) => {
      let isValid = false;

      setDrafts((prev) => {
        const draft = prev.find((row) => row.clientId === clientId);
        isValid = Boolean(draft && isVariantDraftValid(draft));
        return prev;
      });

      if (!isValid) {
        message.error(t('products.form.required'));
        return false;
      }

      markSaved(clientId);
      return true;
    },
    [markSaved, t],
  );

  const startEditDraft = useCallback(
    (clientId: string) => {
      markEditing(clientId);
    },
    [markEditing],
  );

  const deleteDraft = useCallback(
    (clientId: string) => {
      setDrafts((prev) => prev.filter((draft) => draft.clientId !== clientId));
      markSaved(clientId);
    },
    [markSaved],
  );

  const replaceDrafts = useCallback((next: ProductVariantDraft[]) => {
    setDrafts(next);
    setEditingIds(new Set());
  }, []);

  const hasEditingRows = editingIds.size > 0;

  return {
    drafts,
    resetDrafts,
    replaceDrafts,
    isRowEditing,
    hasEditingRows,
    openVariantCreate,
    updateDraft,
    saveDraft,
    startEditDraft,
    deleteDraft,
  };
};
