import { InfoIcon } from "@phosphor-icons/react";
import { observer } from "mobx-react-lite";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import {
  CatalogProductSearchPicker,
  useCatalogProductSearch,
} from "@/features/products/components/catalog-product-search";
import type { CatalogVariant } from "@/features/products/model/product.types";
import { isZeroStockCatalogVariant } from "@/features/wishlist/utils/is-zero-stock-catalog-variant";
import { useWishlistStore } from "@/features/wishlist/model/use-wishlist-store";
import { useNotification } from "@/shared/components/notification/use-notification";

import * as S from "../conversation-client-info-panel.styled";

type ClientWishlistAddSearchProps = {
  clientId: number;
  conversationId?: number;
  wishlistedVariantIds: Set<number>;
};

function isWishlistVariantDisabled(
  variant: CatalogVariant,
  selectedVariantIds: Set<number>,
): boolean {
  return (
    !isZeroStockCatalogVariant(variant) || selectedVariantIds.has(variant.id)
  );
}

export const ClientWishlistAddSearch = observer(
  ({
    clientId,
    conversationId,
    wishlistedVariantIds,
  }: ClientWishlistAddSearchProps) => {
    const { t } = useTranslation();
    const notification = useNotification();
    const wishlistStore = useWishlistStore();
    const catalogSearch = useCatalogProductSearch({ enabled: true });

    const selectedVariantIds = useMemo(
      () => new Set(wishlistedVariantIds),
      [wishlistedVariantIds],
    );

    const zeroStockVariantSelectOptions = useMemo(
      () =>
        catalogSearch.variantSelectOptions.filter((option) =>
          isZeroStockCatalogVariant(option.variant),
        ),
      [catalogSearch.variantSelectOptions],
    );

    const handleVariantSelect = useCallback(
      async (variant: CatalogVariant) => {
        if (isWishlistVariantDisabled(variant, selectedVariantIds)) {
          return;
        }

        try {
          await wishlistStore.addToWishlist(clientId, {
            productId: variant.productId,
            variantId: variant.id,
            conversationId,
          });
          catalogSearch.handleClear();
          catalogSearch.bumpProductPickerKey();
        } catch (error) {
          notification.error({
            title: getApiErrorMessage(
              error,
              t("conversation.clientProfile.wishlist.addError"),
            ),
          });
        }
      },
      [
        catalogSearch,
        clientId,
        conversationId,
        notification,
        selectedVariantIds,
        t,
        wishlistStore,
      ],
    );

    return (
      <S.WishlistAddPanel>
        <CatalogProductSearchPicker
          autoFocus
          showCategoryFilter={false}
          showSearchModeToggle={false}
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
          variantSelectOptions={zeroStockVariantSelectOptions}
          placeholder={t(
            "conversation.clientProfile.wishlist.searchPlaceholder",
          )}
          isVariantDisabled={isWishlistVariantDisabled}
          onCategoryChange={catalogSearch.handleCategoryChange}
          onClear={catalogSearch.handleClear}
          onSearch={catalogSearch.handleSearch}
          onSearchModeChange={catalogSearch.handleSearchModeChange}
          onVariantSelect={handleVariantSelect}
        />

        <S.WishlistAddHint>
          <InfoIcon size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{t("conversation.clientProfile.wishlist.zeroStockHint")}</span>
        </S.WishlistAddHint>
      </S.WishlistAddPanel>
    );
  },
);
