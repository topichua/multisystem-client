import { ListIcon, StackIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";
import { Flex, Segmented, Select, Spin, Tooltip, Typography } from "antd";
import { useTranslation } from "react-i18next";
import type { OrderDraftLine } from "@/features/orders/model/order.types";
import type {
  CatalogSearchMode,
  CatalogSearchProductGroup,
} from "@/features/orders/model/orders-store";

import * as S from "./client-order-drawer.styled";
import * as SearchS from "./client-order-product-search.styled";
import { ClientOrderLinesTable } from "./client-order-lines-table";
import {
  buildGroupedSearchProducts,
  GroupedProductSearchPopup,
} from "./grouped-product-search-popup";
import { VariantSearchContent } from "./variant-search-content";
import type {
  CategorySelectOptionData,
  VariantSelectOption,
  VariantSelectOptionData,
} from "./use-client-order-create-controller";

const { Text } = Typography;
const ALL_CATEGORIES_VALUE = "all";
const EMPTY_PRODUCT_PICKER_VALUE: number[] = [];

type CategorySelectOption = {
  value: string;
  label: string;
  level: number;
  searchLabel: string;
};

type ClientOrderProductsSectionProps = {
  catalogSearchProductGroups: CatalogSearchProductGroup[];
  categoriesLoading: boolean;
  categorySelectOptions: CategorySelectOptionData[];
  catalogSearchLoading: boolean;
  catalogSearchMode: CatalogSearchMode;
  minSearchLength: number;
  orderLines: OrderDraftLine[];
  productPickerKey: number;
  selectedCategoryId: number | null;
  title: ReactNode;
  trimmedSearch: string;
  variantSelectOptions: VariantSelectOption[];
  onCatalogSearchClear: () => void;
  onCategoryChange: (categoryId: number | null) => void;
  onProductSearch: (value: string) => void;
  onQuantityChange: (variantId: number, quantity: number) => void;
  onRemoveLine: (variantId: number) => void;
  onSearchModeChange: (mode: CatalogSearchMode) => void;
  onVariantSelect: (variantId: number) => void;
};

export function ClientOrderProductsSection({
  catalogSearchProductGroups,
  categoriesLoading,
  categorySelectOptions,
  catalogSearchLoading,
  catalogSearchMode,
  minSearchLength,
  orderLines,
  productPickerKey,
  selectedCategoryId,
  title,
  trimmedSearch,
  variantSelectOptions,
  onCatalogSearchClear,
  onCategoryChange,
  onProductSearch,
  onQuantityChange,
  onRemoveLine,
  onSearchModeChange,
  onVariantSelect,
}: ClientOrderProductsSectionProps) {
  const { t } = useTranslation();
  const categoryOptions = useMemo<CategorySelectOption[]>(
    () => [
      {
        value: ALL_CATEGORIES_VALUE,
        label: t("conversation.clientOrders.drawer.allCategories"),
        level: 0,
        searchLabel: t("conversation.clientOrders.drawer.allCategories"),
      },
      ...categorySelectOptions.map((option) => ({
        value: String(option.value),
        label: option.label,
        level: option.level,
        searchLabel: option.label,
      })),
    ],
    [categorySelectOptions, t],
  );

  const categoryValue =
    selectedCategoryId == null
      ? ALL_CATEGORIES_VALUE
      : String(selectedCategoryId);
  const categoryLabelById = useMemo(
    () =>
      new Map(
        categorySelectOptions.map((option) => [option.value, option.label]),
      ),
    [categorySelectOptions],
  );
  const selectedVariantIds = useMemo(
    () => new Set(orderLines.map((line) => line.variantId)),
    [orderLines],
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
  const handleCatalogSearchClear = useCallback(() => {
    resetGroupedExpansion();
    onCatalogSearchClear();
  }, [onCatalogSearchClear, resetGroupedExpansion]);
  const handleProductSearch = useCallback(
    (value: string) => {
      resetGroupedExpansion();
      onProductSearch(value);
    },
    [onProductSearch, resetGroupedExpansion],
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

  const shouldRenderGroupedPopup =
    catalogSearchMode === "grouped" &&
    groupedProducts.length > 0 &&
    trimmedSearch.length >= minSearchLength &&
    !catalogSearchLoading;

  return (
    <S.Section>
      <S.SectionHeader>
        {title}
        <S.SectionCount>
          {t("conversation.clientOrders.drawer.selectedCount", {
            count: orderLines.length,
          })}
        </S.SectionCount>
      </S.SectionHeader>
      <SearchS.ProductsPanel>
        <SearchS.ProductsAddLabel>
          {t("conversation.clientOrders.drawer.addProductDivider")}
        </SearchS.ProductsAddLabel>

        <SearchS.ProductSearchToolbar>
          <Select<string>
            showSearch
            value={categoryValue}
            loading={categoriesLoading}
            aria-label={t(
              "conversation.clientOrders.drawer.categoryFilterAria",
            )}
            optionFilterProp="searchLabel"
            filterOption={(input, option) =>
              String(option?.searchLabel ?? "")
                .toLowerCase()
                .includes(input.trim().toLowerCase())
            }
            options={categoryOptions}
            onChange={(value) =>
              handleCategoryChange(
                value === ALL_CATEGORIES_VALUE ? null : Number(value),
              )
            }
            optionRender={(option) => {
              const data = option.data as CategorySelectOption | undefined;

              return (
                <SearchS.CategoryOption $level={data?.level ?? 0}>
                  {data?.label ?? option.label}
                </SearchS.CategoryOption>
              );
            }}
          />

          <Segmented<CatalogSearchMode>
            value={catalogSearchMode}
            aria-label={t("conversation.clientOrders.drawer.searchModeAria")}
            onChange={handleSearchModeChange}
            options={[
              {
                value: "flat",
                label: (
                  <Tooltip
                    title={t("conversation.clientOrders.drawer.searchModeFlat")}
                  >
                    <SearchS.SearchModeIconLabel>
                      <ListIcon size={17} />
                    </SearchS.SearchModeIconLabel>
                  </Tooltip>
                ),
              },
              {
                value: "grouped",
                label: (
                  <Tooltip
                    title={t(
                      "conversation.clientOrders.drawer.searchModeGrouped",
                    )}
                  >
                    <SearchS.SearchModeIconLabel>
                      <StackIcon size={17} />
                    </SearchS.SearchModeIconLabel>
                  </Tooltip>
                ),
              },
            ]}
          />
        </SearchS.ProductSearchToolbar>

        <Select<number[]>
          key={productPickerKey}
          mode="multiple"
          showSearch={{
            searchValue: trimmedSearch,
            autoClearSearchValue: false,
            onSearch: handleProductSearch,
            filterOption: false,
          }}
          value={EMPTY_PRODUCT_PICKER_VALUE}
          allowClear
          placeholder={t(
            "conversation.clientOrders.drawer.productSearchPlaceholder",
          )}
          loading={catalogSearchLoading}
          style={{ width: "100%" }}
          listHeight={320}
          options={variantSelectOptions}
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
          onClear={handleCatalogSearchClear}
          onSelect={onVariantSelect}
          notFoundContent={
            catalogSearchLoading ? (
              <Flex justify="center" style={{ padding: 12 }}>
                <Spin size="small" />
              </Flex>
            ) : trimmedSearch.length < minSearchLength ? (
              <Text type="secondary">
                {t("conversation.clientOrders.drawer.searchMinChars", {
                  count: minSearchLength,
                })}
              </Text>
            ) : (
              t("conversation.clientOrders.drawer.searchNoResults")
            )
          }
          optionRender={(option) => {
            const data = option.data as VariantSelectOptionData | undefined;
            if (!data?.variant) {
              return option.label;
            }

            const selected = selectedVariantIds.has(data.variant.id);

            return (
              <SearchS.ProductSearchVariantOption
                aria-disabled={selected || !data.variant.inStock}
              >
                <VariantSearchContent
                  selected={selected}
                  variant={data.variant}
                />
              </SearchS.ProductSearchVariantOption>
            );
          }}
        />

        <ClientOrderLinesTable
          orderLines={orderLines}
          onQuantityChange={onQuantityChange}
          onRemove={onRemoveLine}
        />
      </SearchS.ProductsPanel>
    </S.Section>
  );
}
