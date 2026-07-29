import { PlusIcon } from "@phosphor-icons/react";
import { observer } from "mobx-react-lite";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { useInstagramStore } from "@/features/instagram/model/use-instagram-store";
import {
  CatalogProductSearchPopover,
  useCatalogProductSearch,
} from "@/features/products/components/catalog-product-search";
import type { CatalogVariant } from "@/features/products/model/product.types";
import { useNotification } from "@/shared/components/notification/use-notification";

type InstagramLinkProductPickerProps = {
  disabled?: boolean;
  linkedVariantIds?: Set<number>;
  permalink?: string;
  postId: string;
};

export const InstagramLinkProductPicker = observer(
  ({
    disabled,
    linkedVariantIds,
    permalink,
    postId,
  }: InstagramLinkProductPickerProps) => {
    const { t } = useTranslation();
    const store = useInstagramStore();
    const notification = useNotification();
    const [open, setOpen] = useState(false);
    const catalogSearch = useCatalogProductSearch({
      enabled: open,
      loadCategories: true,
    });
    const selectedVariantIds = useMemo(
      () => linkedVariantIds ?? new Set<number>(),
      [linkedVariantIds],
    );

    const handleOpenChange = useCallback(
      (nextOpen: boolean) => {
        setOpen(nextOpen);

        if (!nextOpen) {
          catalogSearch.reset();
        }
      },
      [catalogSearch],
    );

    const handleVariantSelect = useCallback(
      (variant: CatalogVariant) => {
        if (selectedVariantIds.has(variant.id)) {
          return;
        }

        void store
          .linkProductToPost({
            productId: variant.productId,
            productVariantId: variant.id,
            postId,
            permalink,
          })
          .then(() => {
            notification.success({ title: t("instagram.linkProductSuccess") });
          })
          .catch((error: unknown) => {
            notification.error({
              title: getApiErrorMessage(
                error,
                t("instagram.linkProductFailed"),
              ),
            });
          });
      },
      [notification, permalink, postId, selectedVariantIds, store, t],
    );

    return (
      <CatalogProductSearchPopover
        open={open}
        disabled={disabled || store.linkProductLoading}
        loading={store.linkProductLoading}
        buttonIcon={<PlusIcon size={16} />}
        buttonLabel={
          store.linkProductLoading
            ? t("instagram.linkingProduct")
            : t("instagram.linkProduct")
        }
        catalogSearchLoading={catalogSearch.catalogSearchLoading}
        catalogSearchMode={catalogSearch.catalogSearchMode}
        catalogSearchProductGroups={catalogSearch.catalogSearchProductGroups}
        categories={catalogSearch.categories}
        categoriesLoading={catalogSearch.categoriesLoading}
        minSearchLength={catalogSearch.minSearchLength}
        productPickerKey={catalogSearch.productPickerKey}
        selectedCategoryId={catalogSearch.selectedCategoryId}
        selectedVariantIds={selectedVariantIds}
        trimmedSearch={catalogSearch.trimmedSearch}
        variantSelectOptions={catalogSearch.variantSelectOptions}
        onCategoryChange={catalogSearch.handleCategoryChange}
        onClear={catalogSearch.handleClear}
        onOpenChange={handleOpenChange}
        onSearch={catalogSearch.handleSearch}
        onSearchModeChange={catalogSearch.handleSearchModeChange}
        onVariantSelect={handleVariantSelect}
      />
    );
  },
);
