import { Button, Form, Spin, message } from 'antd';
import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { ProductCreateFormValues } from '../product-modal.types';
import { defaultCreateValues, productToCreateValues } from '../product-modal.types';
import { ProductVariantsListSection } from '../product-detail/product-variants-list-section';
import { useProductVariantInline } from '../product-detail/use-product-variant-inline';
import { useVariantDraftModal } from '../product-detail/use-variant-draft-modal';
import { VARIANT_DRAFT_TABLE_SCROLL_X } from '../product-detail/variant-draft-table-layout';
import { useVariantDraftTableColumns } from '../product-detail/use-variant-draft-table-columns';
import { VariantImagePickerModal } from '../product-detail/variant-image-picker-modal';
import { ProductInstagramAiDrawer } from '../product-instagram-ai-drawer';

import type { ProductCreateFormProps } from './product-create-form.types';
import { ProductFormFields } from './product-form-fields';
import { ProductGalleryField } from './product-gallery-field';
import { useProductEditAutosave } from './use-product-edit-autosave';
import { useProductGallery } from './use-product-gallery';
import { useProductInstagramFill } from './use-product-instagram-fill';
import { useProductVariantImagePicker } from './use-product-variant-image-picker';

export const PRODUCT_FORM_ID = 'product-form';

export const ProductCreateForm = observer(
  ({
    mode = 'create',
    product = null,
    categoryOptions,
    submitLoading,
    variantDeleteLoadingId = null,
    onSubmit,
    onPatchProduct,
    onPersistGallery,
    onCreateVariant,
    onUpdateVariant,
    onDeleteVariant,
    onProductRefresh,
    aiToolsOpen,
    setAiToolsOpen,
  }: ProductCreateFormProps) => {
    const { t } = useTranslation();
    const isEditMode = mode === 'edit';
    const [form] = Form.useForm<ProductCreateFormValues>();
    const [isSaving, setIsSaving] = useState(false);
    const [variantSavingClientId, setVariantSavingClientId] = useState<string | null>(null);

    const variantDraftModal = useVariantDraftModal();
    const variantInline = useProductVariantInline({
      product: isEditMode ? product : null,
      onCreateVariant: onCreateVariant ?? (async () => {}),
      onUpdateVariant: onUpdateVariant ?? (async () => {}),
      onDeleteVariant: onDeleteVariant ?? (async () => {}),
      variantSaveOptions: isEditMode ? { silent: true } : undefined,
    });

    const gallery = useProductGallery({
      isEditMode,
      product,
      isSaving,
      onPersistGallery,
    });

    const { handleEditFieldBlur } = useProductEditAutosave({
      form,
      isEditMode,
      product,
      onPatchProduct,
    });

    const handleVariantFieldBlur = useCallback(
      async (clientId: string) => {
        if (!isEditMode || !variantInline.isRowEditing(clientId)) {
          return;
        }

        setVariantSavingClientId(clientId);
        try {
          await variantInline.saveDraft(clientId);
        } finally {
          setVariantSavingClientId(null);
        }
      },
      [isEditMode, variantInline],
    );

    const imagePicker = useProductVariantImagePicker({
      isEditMode,
      product,
      gallery: gallery.gallery,
      variantInline,
      variantDraftModal,
      onProductRefresh,
      onVariantFieldBlur: handleVariantFieldBlur,
      addGalleryFile: gallery.addGalleryFile,
    });

    const instagramFill = useProductInstagramFill({
      aiToolsOpen,
      form,
      clearGallery: gallery.clearGallery,
      replaceGallery: gallery.replaceGallery,
      replaceVariantDrafts: variantDraftModal.replaceDrafts,
      onFilled: () => setAiToolsOpen(false),
    });

    const currencyWatch = Form.useWatch('currency', form) ?? 'UAH';

    const createVariantColumns = useVariantDraftTableColumns({
      currency: currencyWatch,
      isRowEditing: variantDraftModal.isRowEditing,
      onUpdateDraft: variantDraftModal.updateDraft,
      onSaveDraft: (clientId) => void variantDraftModal.saveDraft(clientId),
      onStartEditDraft: variantDraftModal.startEditDraft,
      onDeleteDraft: variantDraftModal.deleteDraft,
      onOpenImagePicker: imagePicker.openPicker,
    });

    const editVariantColumns = useVariantDraftTableColumns({
      currency: currencyWatch,
      isRowEditing: variantInline.isRowEditing,
      onUpdateDraft: variantInline.updateDraft,
      onSaveDraft: variantInline.saveDraft,
      onStartEditDraft: variantInline.startEditDraft,
      onDeleteDraft: variantInline.deleteDraft,
      variantDeleteLoadingId,
      autoSaveOnBlur: isEditMode,
      variantSavingClientId,
      onFieldBlur: (clientId) => void handleVariantFieldBlur(clientId),
      onOpenImagePicker: imagePicker.openPicker,
    });

    useEffect(() => {
      if (!isEditMode || !product) {
        return;
      }

      form.setFieldsValue(productToCreateValues(product));
      // Only re-seed the form when navigating to another product.
      // eslint-disable-next-line react-hooks/exhaustive-deps -- product fields are auto-saved on blur.
    }, [form, isEditMode, product?.id]);

    const handleFinish = async (values: ProductCreateFormValues) => {
      if (isEditMode) {
        return;
      }

      setIsSaving(true);
      try {
        const { coverFile, coverUrl, galleryImages } = gallery.resolveCoverAndGalleryFiles();

        if (variantDraftModal.hasEditingRows) {
          message.error(t('products.variant.finishEditingFirst'));
          return;
        }

        const created = await onSubmit(
          values,
          coverFile,
          variantDraftModal.drafts,
          galleryImages,
          coverUrl,
          gallery.gallery,
        );

        if (created) {
          form.resetFields();
          gallery.clearGallery();
          variantDraftModal.resetDrafts();
        }
      } finally {
        setIsSaving(false);
      }
    };

    const handleAddGalleryFile = (file: File) => {
      gallery.addGalleryFile(file);
    };

    return (
      <Spin spinning={isSaving || instagramFill.busy}>
        <Form
          id={PRODUCT_FORM_ID}
          form={form}
          layout="vertical"
          initialValues={defaultCreateValues}
          onFinish={(values) => void handleFinish(values)}
          style={{ maxWidth: 800 }}
        >
          <ProductFormFields
            isEditMode={isEditMode}
            categoryOptions={categoryOptions}
            onEditFieldBlur={(field) => void handleEditFieldBlur(field)}
          />

          <ProductGalleryField
            gallery={gallery.gallery}
            resolvedCoverId={gallery.resolvedCoverId}
            onSelectCover={gallery.selectCover}
            onRemoveItem={gallery.removeGalleryItem}
            onClearAll={gallery.clearGallery}
            onAddFile={handleAddGalleryFile}
          />

          {isEditMode && product ? (
            <ProductVariantsListSection
              count={variantInline.tableRows.length}
              dataSource={variantInline.tableRows}
              columns={editVariantColumns}
              rowKey="clientId"
              variantSaveLoading={variantSavingClientId != null}
              onAddVariant={variantInline.openVariantCreate}
              tableScroll={{ x: VARIANT_DRAFT_TABLE_SCROLL_X, y: 280 }}
            />
          ) : (
            <ProductVariantsListSection
              count={variantDraftModal.drafts.length}
              dataSource={variantDraftModal.drafts}
              columns={createVariantColumns}
              rowKey="clientId"
              variantSaveLoading={submitLoading}
              onAddVariant={variantDraftModal.openVariantCreate}
              tableScroll={{ x: VARIANT_DRAFT_TABLE_SCROLL_X, y: 280 }}
            />
          )}

          {!isEditMode ? (
            <Form.Item style={{ marginTop: 20 }}>
              <Button type="primary" htmlType="submit" loading={submitLoading || isSaving}>
                {t('products.modalCreateOk')}
              </Button>
            </Form.Item>
          ) : null}

          <VariantImagePickerModal
            open={imagePicker.clientId != null}
            images={imagePicker.productGalleryImages}
            selectedUrl={imagePicker.selectedUrl}
            uploadLoading={imagePicker.uploadLoading}
            onClose={imagePicker.closePicker}
            onSelect={(url, uploadedFile) => {
              if (imagePicker.clientId == null) {
                return;
              }
              imagePicker.applySelection(imagePicker.clientId, url, uploadedFile);
            }}
            onUploadNew={imagePicker.uploadNew}
          />
        </Form>

        {!isEditMode ? (
          <ProductInstagramAiDrawer
            open={aiToolsOpen}
            onClose={() => setAiToolsOpen(false)}
            analyzeBusy={instagramFill.busy}
            submitLoading={submitLoading}
            onAnalyzeAndFill={instagramFill.analyzeAndFill}
          />
        ) : null}
      </Spin>
    );
  },
);

export type { ProductCreateFormProps, CategoryOption } from './product-create-form.types';
export type { GalleryItem } from './product-gallery';
