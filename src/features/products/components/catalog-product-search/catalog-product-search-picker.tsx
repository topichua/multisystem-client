import { ListIcon, StackIcon } from "@phosphor-icons/react";
import type { CSSProperties, ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";
import { Flex, Segmented, Select, Spin, Tooltip, Typography } from "antd";
import { useTranslation } from "react-i18next";

import { CategoryTreeSelect } from "@/features/categories/components/category-tree-select";
import { flattenCategories } from "@/features/categories/model/category-tree";
import type { Category } from "@/features/categories/model/category.types";
import type { CatalogSearchMode } from "@/features/orders/model/orders-store";
import type { CatalogSearchProductGroup } from "@/features/orders/model/orders-store";
import type { CatalogVariant } from "@/features/products/model/product.types";

import { EMPTY_PRODUCT_PICKER_VALUE } from "./catalog-product-search.constants";
import * as S from "./catalog-product-search.styled";
import type {
  VariantSelectOption,
  VariantSelectOptionData,
} from "./catalog-product-search.types";
import { CatalogVariantSearchRow } from "./catalog-variant-search-row";
import { GroupedProductSearchPopup } from "./grouped-product-search-popup";
import { buildGroupedSearchProducts } from "./grouped-product-search-popup.utils";

const { Text } = Typography;

const defaultIsVariantDisabled = (
  variant: CatalogVariant,
  selectedVariantIds: Set<number>,
) => !variant.inStock || selectedVariantIds.has(variant.id);

export type CatalogProductSearchPickerProps = {
  autoFocus?: boolean;
  dropdownOpen?: boolean;
  categories: Category[];
  catalogSearchLoading: boolean;
  catalogSearchMode: CatalogSearchMode;
  catalogSearchProductGroups: CatalogSearchProductGroup[];
  categoriesLoading: boolean;
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;
  listHeight?: number;
  minSearchLength: number;
  productPickerKey?: number;
  selectedCategoryId: number | null;
  selectedVariantIds: Set<number>;
  showAddLabel?: boolean;
  showCategoryFilter?: boolean;
  showSearchModeToggle?: boolean;
  style?: CSSProperties;
  trimmedSearch: string;
  variantSelectOptions: VariantSelectOption[];
  addLabel?: ReactNode;
  placeholder?: string;
  isVariantDisabled?: (
    variant: CatalogVariant,
    selectedVariantIds: Set<number>,
  ) => boolean;
  onCategoryChange: (categoryId: number | null) => void;
  onClear: () => void;
  onSearch: (value: string) => void;
  onSearchModeChange: (mode: CatalogSearchMode) => void;
  onVariantSelect: (variant: CatalogVariant) => void;
};

export function CatalogProductSearchPicker({
  autoFocus = false,
  dropdownOpen,
  categories,
  catalogSearchLoading,
  catalogSearchMode,
  catalogSearchProductGroups,
  categoriesLoading,
  getPopupContainer,
  listHeight = 320,
  minSearchLength,
  productPickerKey = 0,
  selectedCategoryId,
  selectedVariantIds,
  showAddLabel = false,
  showCategoryFilter = true,
  showSearchModeToggle = true,
  style,
  trimmedSearch,
  variantSelectOptions,
  addLabel,
  placeholder,
  isVariantDisabled = defaultIsVariantDisabled,
  onCategoryChange,
  onClear,
  onSearch,
  onSearchModeChange,
  onVariantSelect,
}: CatalogProductSearchPickerProps) {
  const { t } = useTranslation();
  const categoryLabelById = useMemo(
    () =>
      new Map(
        flattenCategories(categories).map((category) => [
          category.id,
          category.name,
        ]),
      ),
    [categories],
  );
  const groupedProducts = useMemo(
    () =>
      catalogSearchMode === "grouped"
        ? buildGroupedSearchProducts({
            catalogSearchProductGroups,
            categoryLabelById,
            selectedVariantIds,
          })
        : [],
    [
      catalogSearchMode,
      catalogSearchProductGroups,
      categoryLabelById,
      selectedVariantIds,
    ],
  );
  const [expandedProductKeys, setExpandedProductKeys] = useState<Set<string>>(
    () => new Set(),
  );
  const resetGroupedExpansion = useCallback(() => {
    setExpandedProductKeys((current) =>
      current.size === 0 ? current : new Set(),
    );
  }, []);
  const toggleGroupedProduct = useCallback((productKey: string) => {
    setExpandedProductKeys((current) => {
      const next = new Set(current);

      if (next.has(productKey)) {
        next.delete(productKey);
      } else {
        next.add(productKey);
      }

      return next;
    });
  }, []);
  const handleClear = useCallback(() => {
    resetGroupedExpansion();
    onClear();
  }, [onClear, resetGroupedExpansion]);
  const handleSearch = useCallback(
    (value: string) => {
      resetGroupedExpansion();
      onSearch(value);
    },
    [onSearch, resetGroupedExpansion],
  );
  const handleCategoryChange = useCallback(
    (categoryId: number | null) => {
      resetGroupedExpansion();
      onCategoryChange(categoryId);
    },
    [onCategoryChange, resetGroupedExpansion],
  );
  const handleSearchModeChange = useCallback(
    (mode: CatalogSearchMode) => {
      resetGroupedExpansion();
      onSearchModeChange(mode);
    },
    [onSearchModeChange, resetGroupedExpansion],
  );
  const handleVariantSelect = useCallback(
    (variantId: number) => {
      const option = variantSelectOptions.find(
        (item) => item.value === variantId,
      );

      if (!option || isVariantDisabled(option.variant, selectedVariantIds)) {
        return;
      }

      onVariantSelect(option.variant);
    },
    [
      onVariantSelect,
      selectedVariantIds,
      variantSelectOptions,
      isVariantDisabled,
    ],
  );
  const selectOptions = useMemo(
    () =>
      variantSelectOptions.map((option) => ({
        ...option,
        disabled: isVariantDisabled(option.variant, selectedVariantIds),
      })),
    [selectedVariantIds, variantSelectOptions, isVariantDisabled],
  );
  const shouldRenderGroupedPopup =
    catalogSearchMode === "grouped" &&
    groupedProducts.length > 0 &&
    trimmedSearch.length >= minSearchLength &&
    !catalogSearchLoading;
  const showToolbar = showCategoryFilter || showSearchModeToggle;

  return (
    <S.PickerRoot style={style}>
      {showAddLabel && (
        <S.PickerAddLabel>
          {addLabel ?? t("products.catalogSearch.addLabel")}
        </S.PickerAddLabel>
      )}

      {showToolbar && (
        <S.ProductSearchToolbar>
          {showCategoryFilter && (
            <CategoryTreeSelect
              allowClear={false}
              allowNoCategory
              categories={categories}
              disabled={categoriesLoading}
              getPopupContainer={getPopupContainer}
              noCategoryLabel={t("products.catalogSearch.allCategories")}
              searchPlaceholder={t("categories.searchPlaceholder")}
              value={selectedCategoryId}
              onChange={(value) =>
                handleCategoryChange(typeof value === "number" ? value : null)
              }
            />
          )}

          {showSearchModeToggle && (
            <Segmented<CatalogSearchMode>
              value={catalogSearchMode}
              aria-label={t("products.catalogSearch.searchModeAria")}
              onChange={handleSearchModeChange}
              options={[
                {
                  value: "flat",
                  label: (
                    <Tooltip title={t("products.catalogSearch.searchModeFlat")}>
                      <S.SearchModeIconLabel>
                        <ListIcon size={17} />
                      </S.SearchModeIconLabel>
                    </Tooltip>
                  ),
                },
                {
                  value: "grouped",
                  label: (
                    <Tooltip
                      title={t("products.catalogSearch.searchModeGrouped")}
                    >
                      <S.SearchModeIconLabel>
                        <StackIcon size={17} />
                      </S.SearchModeIconLabel>
                    </Tooltip>
                  ),
                },
              ]}
            />
          )}
        </S.ProductSearchToolbar>
      )}

      <Select<number[]>
        key={productPickerKey}
        mode="multiple"
        autoFocus={autoFocus}
        open={dropdownOpen}
        getPopupContainer={getPopupContainer}
        showSearch={{
          searchValue: trimmedSearch,
          autoClearSearchValue: false,
          onSearch: handleSearch,
          filterOption: false,
        }}
        value={EMPTY_PRODUCT_PICKER_VALUE}
        allowClear
        placeholder={placeholder ?? t("products.catalogSearch.placeholder")}
        loading={catalogSearchLoading}
        style={{ width: "100%" }}
        listHeight={listHeight}
        options={selectOptions}
        popupRender={(originNode) =>
          shouldRenderGroupedPopup ? (
            <GroupedProductSearchPopup
              expandedProductKeys={expandedProductKeys}
              groupedProducts={groupedProducts}
              selectedVariantIds={selectedVariantIds}
              onToggleProduct={toggleGroupedProduct}
              onVariantSelect={onVariantSelect}
            />
          ) : (
            originNode
          )
        }
        onClear={handleClear}
        onSelect={handleVariantSelect}
        notFoundContent={
          catalogSearchLoading ? (
            <Flex justify="center" style={{ padding: 12 }}>
              <Spin size="small" />
            </Flex>
          ) : trimmedSearch.length < minSearchLength ? (
            <Text type="secondary">
              {t("products.catalogSearch.searchMinChars", {
                count: minSearchLength,
              })}
            </Text>
          ) : (
            t("products.catalogSearch.searchNoResults")
          )
        }
        optionRender={(option) => {
          const data = option.data as VariantSelectOptionData | undefined;
          if (!data?.variant) {
            return option.label;
          }

          const selected = selectedVariantIds.has(data.variant.id);
          const disabled = isVariantDisabled(data.variant, selectedVariantIds);

          return (
            <S.ProductSearchVariantOption $disabled={disabled}>
              <CatalogVariantSearchRow
                disabled={disabled}
                selected={selected}
                variant={data.variant}
              />
            </S.ProductSearchVariantOption>
          );
        }}
      />
    </S.PickerRoot>
  );
}
