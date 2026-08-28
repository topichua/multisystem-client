import {
  ListIcon,
  MagnifyingGlassIcon,
  StackIcon,
} from "@phosphor-icons/react";
import {
  Alert,
  Button,
  Empty,
  Flex,
  Input,
  Segmented,
  Spin,
  Typography,
} from "antd";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { UIEvent } from "react";

import { CategoryTreeSelect } from "@/features/categories/components/category-tree-select";
import { flattenCategories } from "@/features/categories/model/category-tree";
import type { useCategoriesStore } from "@/features/categories/model/use-categories-store";
import {
  CatalogVariantSearchOption,
  GroupedProductSearchPopup,
  type GroupedSearchProduct,
} from "@/features/products/components/catalog-product-search";
import type { CatalogVariant } from "@/features/products/model/product.types";
import { getCatalogVariantImageUrl } from "@/features/products/utils/catalog-variant-display";

import type {
  SupplyPickerMode,
  VariantGroup,
} from "../stock-supply-modal.types";
import * as S from "../stock-supply-modal.styled";

const { Text } = Typography;

const EMPTY_SELECTED_VARIANT_IDS = new Set<number>();
const allowAllSupplyVariants = () => false;

function toGroupedSearchProducts(
  groups: VariantGroup[],
  categoryLabelById: Map<number, string>,
): GroupedSearchProduct[] {
  return groups.map((group) => {
    const categoryId = group.variants[0]?.product.categoryId;

    return {
      categoryName:
        categoryId == null ? null : (categoryLabelById.get(categoryId) ?? null),
      imageUrl:
        group.variants
          .map((variant) => getCatalogVariantImageUrl(variant))
          .find(Boolean) ?? null,
      productKey: group.key,
      productName: group.productName,
      selectedCount: 0,
      variants: group.variants,
    };
  });
}

type StockSupplyVariantsPickerProps = {
  t: ReturnType<typeof import("react-i18next").useTranslation>["t"];
  categoriesStore: ReturnType<typeof useCategoriesStore>;
  loadError: string | null;
  search: string;
  pickerMode: SupplyPickerMode;
  selectedCategoryId: number | null;
  filteredAvailableVariants: CatalogVariant[];
  groupedAvailableVariants: VariantGroup[];
  variantsLoading: boolean;
  variantsLoadingMore: boolean;
  onSearchChange: (value: string) => void;
  onPickerModeChange: (mode: SupplyPickerMode) => void;
  onCategoryChange: (value: number | null) => void;
  onLoadMore: () => void;
  onAddAll: () => void;
  onAddVariant: (variant: CatalogVariant) => void;
};

export const StockSupplyVariantsPicker = memo(
  function StockSupplyVariantsPicker({
    t,
    categoriesStore,
    loadError,
    search,
    pickerMode,
    selectedCategoryId,
    filteredAvailableVariants,
    groupedAvailableVariants,
    variantsLoading,
    variantsLoadingMore,
    onSearchChange,
    onPickerModeChange,
    onCategoryChange,
    onLoadMore,
    onAddAll,
    onAddVariant,
  }: StockSupplyVariantsPickerProps) {
    const listRef = useRef<HTMLDivElement>(null);
    const [expandedProductKeys, setExpandedProductKeys] = useState<Set<string>>(
      () => new Set(),
    );

    const categoryLabelById = useMemo(
      () =>
        new Map(
          flattenCategories(categoriesStore.categories).map((category) => [
            category.id,
            category.name,
          ]),
        ),
      [categoriesStore.categories],
    );

    const groupedProducts = useMemo(
      () =>
        pickerMode === "grouped"
          ? toGroupedSearchProducts(groupedAvailableVariants, categoryLabelById)
          : [],
      [categoryLabelById, groupedAvailableVariants, pickerMode],
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

    const handleSearchChange = useCallback(
      (value: string) => {
        resetGroupedExpansion();
        onSearchChange(value);
      },
      [onSearchChange, resetGroupedExpansion],
    );

    const handlePickerModeChange = useCallback(
      (mode: SupplyPickerMode) => {
        resetGroupedExpansion();
        onPickerModeChange(mode);
      },
      [onPickerModeChange, resetGroupedExpansion],
    );

    const handleCategoryChange = useCallback(
      (value: number | null) => {
        resetGroupedExpansion();
        onCategoryChange(value);
      },
      [onCategoryChange, resetGroupedExpansion],
    );

    const handleListScroll = useCallback(
      (event: UIEvent<HTMLDivElement>) => {
        const target = event.currentTarget;
        const remaining =
          target.scrollHeight - target.scrollTop - target.clientHeight;

        if (remaining <= 80) {
          onLoadMore();
        }
      },
      [onLoadMore],
    );

    useEffect(() => {
      const list = listRef.current;
      if (!list || variantsLoading || variantsLoadingMore || loadError) {
        return;
      }

      if (list.scrollHeight <= list.clientHeight + 8) {
        queueMicrotask(() => {
          onLoadMore();
        });
      }
    }, [
      filteredAvailableVariants.length,
      loadError,
      onLoadMore,
      variantsLoading,
      variantsLoadingMore,
    ]);

    const showInitialSpinner =
      variantsLoading && filteredAvailableVariants.length === 0 && !loadError;
    const showEmpty =
      !variantsLoading && !loadError && filteredAvailableVariants.length === 0;

    return (
      <S.VariantsColumn>
        <Flex align="center" justify="space-between" gap={12}>
          <Text strong>{t("products.stockSupply.addVariants")}</Text>
          <Button
            type="link"
            size="small"
            disabled={filteredAvailableVariants.length === 0}
            onClick={onAddAll}
          >
            {t("products.stockSupply.addAll", {
              count: filteredAvailableVariants.length,
            })}
          </Button>
        </Flex>

        <Flex gap={8} align="center">
          <CategoryTreeSelect
            allowClear={false}
            allowNoCategory
            categories={categoriesStore.categories}
            disabled={categoriesStore.listLoading}
            noCategoryLabel={t("products.catalogSearch.allCategories")}
            searchPlaceholder={t("categories.searchPlaceholder")}
            value={selectedCategoryId}
            style={{ flex: 1, minWidth: 0 }}
            onChange={(value) =>
              handleCategoryChange(typeof value === "number" ? value : null)
            }
          />
          <Segmented<SupplyPickerMode>
            value={pickerMode}
            aria-label={t("products.stockSupply.viewModeAria")}
            onChange={handlePickerModeChange}
            options={[
              {
                value: "flat",
                label: <ListIcon size={17} />,
              },
              {
                value: "grouped",
                label: <StackIcon size={17} />,
              },
            ]}
          />
        </Flex>

        <Input
          allowClear
          value={search}
          prefix={<MagnifyingGlassIcon size={16} />}
          placeholder={t("products.stockSupply.searchPlaceholder")}
          onChange={(event) => handleSearchChange(event.target.value)}
        />

        <S.VariantsList ref={listRef} onScroll={handleListScroll}>
          {loadError ? (
            <Alert type="error" message={loadError} showIcon />
          ) : showInitialSpinner ? (
            <Flex align="center" justify="center" style={{ minHeight: 220 }}>
              <Spin />
            </Flex>
          ) : showEmpty ? (
            <Flex align="center" justify="center" style={{ minHeight: 220 }}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={t("products.stockSupply.emptyVariants")}
              />
            </Flex>
          ) : pickerMode === "grouped" ? (
            <GroupedProductSearchPopup
              embedded
              preventPopupClose={false}
              expandedProductKeys={expandedProductKeys}
              groupedProducts={groupedProducts}
              selectedVariantIds={EMPTY_SELECTED_VARIANT_IDS}
              isVariantDisabled={allowAllSupplyVariants}
              onToggleProduct={toggleGroupedProduct}
              onVariantSelect={onAddVariant}
            />
          ) : (
            filteredAvailableVariants.map((variant) => (
              <CatalogVariantSearchOption
                key={variant.id}
                variant={variant}
                onSelect={onAddVariant}
              />
            ))
          )}

          {variantsLoadingMore ? (
            <Flex align="center" justify="center" style={{ padding: 12 }}>
              <Spin size="small" />
            </Flex>
          ) : null}
        </S.VariantsList>
      </S.VariantsColumn>
    );
  },
);
