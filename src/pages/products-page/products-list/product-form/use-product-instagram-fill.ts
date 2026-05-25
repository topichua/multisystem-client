import type { FormInstance } from 'antd';
import { message } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { ProductVariantDraft } from '@/features/products/model/product.types';
import { useAiToolsStore } from '@/features/products/model/use-ai-tools-store';
import { buildVariantDraftsFromInstagramAnalyze } from '@/features/products/utils/build-variant-drafts-from-instagram-analyze';
import {
  fetchUrlAsImageFile,
  isDownloadableProductImageUrl,
} from '@/features/products/utils/fetch-remote-image-file';

import type { ProductCreateFormValues } from '../product-modal.types';
import { createGalleryItemFromFile, type GalleryItem } from './product-gallery';

type UseProductInstagramFillParams = {
  aiToolsOpen: boolean;
  form: FormInstance<ProductCreateFormValues>;
  clearGallery: () => void;
  replaceGallery: (items: GalleryItem[]) => void;
  replaceVariantDrafts: (drafts: ProductVariantDraft[]) => void;
  onFilled: () => void;
};

export const useProductInstagramFill = ({
  aiToolsOpen,
  form,
  clearGallery,
  replaceGallery,
  replaceVariantDrafts,
  onFilled,
}: UseProductInstagramFillParams) => {
  const { t } = useTranslation();
  const aiToolsStore = useAiToolsStore();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!aiToolsOpen) {
      return;
    }
    void aiToolsStore.loadPosts();
  }, [aiToolsOpen, aiToolsStore]);

  const analyzeAndFill = useCallback(async () => {
    const selectedPostId = aiToolsStore.selectedPostId;
    if (selectedPostId == null) {
      return;
    }

    setBusy(true);
    try {
      const analyzed = await aiToolsStore.analyzeProduct(selectedPostId);
      if (!analyzed) {
        return;
      }

      const categoryId =
        analyzed.categoryId != null && Number.isFinite(analyzed.categoryId)
          ? analyzed.categoryId
          : undefined;

      const price = analyzed.price ?? 0;
      const imageUrls = analyzed.images.filter(isDownloadableProductImageUrl);
      const fetched = await Promise.all(
        imageUrls.map((url, index) =>
          fetchUrlAsImageFile(url, `instagram-${selectedPostId}-${index}`),
        ),
      );
      const imageFiles = fetched.filter((f): f is File => f != null);

      clearGallery();

      const nextGallery = imageFiles.map((file) => createGalleryItemFromFile(file));
      replaceGallery(nextGallery);

      const variantDrafts = buildVariantDraftsFromInstagramAnalyze(analyzed.variants, price);

      const existingReferenceGroupId = form.getFieldValue('referenceGroupId') as string | undefined;

      form.setFieldsValue({
        name: analyzed.name,
        description: analyzed.description,
        price,
        mediaUrl: '',
        sourceType: 'instagram_post',
        sourceId: selectedPostId,
        referenceGroupId: analyzed.brandOrLabel.trim()
          ? analyzed.brandOrLabel.trim()
          : (existingReferenceGroupId ?? ''),
        categoryId,
      });

      replaceVariantDrafts(variantDrafts);

      message.success(t('products.instagram.fillFormSuccess'));
      aiToolsStore.clearSelectedPost();
      onFilled();
    } finally {
      setBusy(false);
    }
  }, [aiToolsStore, clearGallery, form, onFilled, replaceGallery, replaceVariantDrafts, t]);

  return { busy, analyzeAndFill };
};
