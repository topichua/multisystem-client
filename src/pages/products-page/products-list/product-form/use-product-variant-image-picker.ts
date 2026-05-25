import { useMemo, useState } from 'react';

import type { ProductDetails } from '@/features/products/model/product.types';

import { collectProductGalleryImages } from '../product-detail/product-gallery-images';
import { filterProductMediaItems } from '../product-detail/product-detail-media';
import { productsApi } from '@/features/products/api/products-api';
import type { useProductVariantInline } from '../product-detail/use-product-variant-inline';
import type { useVariantDraftModal } from '../product-detail/use-variant-draft-modal';
import type { GalleryItem } from './product-gallery';

type VariantDraftModal = ReturnType<typeof useVariantDraftModal>;
type VariantInline = ReturnType<typeof useProductVariantInline>;

type UseProductVariantImagePickerParams = {
  isEditMode: boolean;
  product: ProductDetails | null;
  gallery: GalleryItem[];
  variantInline: VariantInline;
  variantDraftModal: VariantDraftModal;
  onProductRefresh?: () => void | Promise<void>;
  onVariantFieldBlur: (clientId: string) => void | Promise<void>;
  addGalleryFile: (file: File) => GalleryItem;
};

export const useProductVariantImagePicker = ({
  isEditMode,
  product,
  gallery,
  variantInline,
  variantDraftModal,
  onProductRefresh,
  onVariantFieldBlur,
  addGalleryFile,
}: UseProductVariantImagePickerParams) => {
  const [clientId, setClientId] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  const productGalleryImages = useMemo(
    () => collectProductGalleryImages(isEditMode ? product : null, gallery),
    [gallery, isEditMode, product],
  );

  const activeRow = useMemo(() => {
    if (clientId == null) {
      return undefined;
    }

    if (isEditMode) {
      return variantInline.tableRows.find((row) => row.clientId === clientId);
    }

    return variantDraftModal.drafts.find((row) => row.clientId === clientId);
  }, [clientId, isEditMode, variantDraftModal.drafts, variantInline.tableRows]);

  const openPicker = (rowClientId: string) => {
    setClientId(rowClientId);
  };

  const closePicker = () => {
    setClientId(null);
  };

  const applySelection = (rowClientId: string, url: string, uploadedFile?: File) => {
    const galleryItem = gallery.find((item) => item.previewUrl === url);
    const file = uploadedFile ?? galleryItem?.file ?? null;
    const patch = file ? { imageFile: file, imageUrl: '' } : { imageUrl: url, imageFile: null };

    if (isEditMode) {
      variantInline.updateDraft(rowClientId, patch);
      if (variantInline.isRowEditing(rowClientId)) {
        void onVariantFieldBlur(rowClientId);
      }
      return;
    }

    variantDraftModal.updateDraft(rowClientId, patch);
  };

  const uploadNew = async (file: File): Promise<string | null> => {
    if (isEditMode) {
      if (!product) {
        return null;
      }

      setUploadLoading(true);

      try {
        const before = new Set(
          (await productsApi.listMedia(product.id)).map((item) => item.url.trim()),
        );
        const sortOrder = filterProductMediaItems(product).length;

        await productsApi.uploadProductMedia(product.id, file, sortOrder);
        await onProductRefresh?.();

        const after = await productsApi.listMedia(product.id);
        const added = after.find((item) => !before.has(item.url.trim()));

        return added?.url.trim() ?? after[after.length - 1]?.url.trim() ?? null;
      } finally {
        setUploadLoading(false);
      }
    }

    const item = addGalleryFile(file);
    return item.previewUrl;
  };

  const selectedUrl =
    activeRow?.imageFile != null
      ? gallery.find((item) => item.file === activeRow.imageFile)?.previewUrl
      : activeRow?.imageUrl;

  return {
    clientId,
    uploadLoading,
    productGalleryImages,
    selectedUrl,
    openPicker,
    closePicker,
    applySelection,
    uploadNew,
  };
};
