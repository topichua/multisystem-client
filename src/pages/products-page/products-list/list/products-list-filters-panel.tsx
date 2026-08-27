import { FunnelSimpleIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import {
  Button,
  Checkbox,
  Divider,
  Drawer,
  Flex,
  Input,
  InputNumber,
  Segmented,
  Typography,
  theme,
} from "antd";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import type { Category } from "@/features/categories/model/category.types";
import { useCategoriesStore } from "@/features/categories/model/use-categories-store";
import {
  PRODUCTS_LIST_BY_STATUS_VALUES,
  type ProductsListByStatus,
} from "@/features/products/model/product.types";
import { useProductsStore } from "@/features/products/model/use-products-store";
import { useWorkspaceSettingsStore } from "@/features/workspace-settings/model/use-workspace-settings-store";
import { useIsMobileViewport } from "@/utils/use-media-query";

import { ProductsListCustomFieldFiltersSection } from "./products-list-custom-field-filters-section";

const { Text } = Typography;
const CATEGORY_LEVEL_INDENT = 20;

type CategoryFilterItem = {
  category: Category;
  level: number;
};

const flattenCategoriesForFilter = (
  categories: Category[],
  level = 0,
): CategoryFilterItem[] =>
  categories.flatMap((category) => [
    { category, level },
    ...flattenCategoriesForFilter(category.children ?? [], level + 1),
  ]);

const filterCategoriesForFilter = (
  categories: Category[],
  query: string,
): CategoryFilterItem[] => {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return flattenCategoriesForFilter(categories);
  }

  const walk = (nodes: Category[], level: number): CategoryFilterItem[] =>
    nodes.flatMap((category) => {
      const categoryMatches = category.name
        .toLowerCase()
        .includes(normalizedQuery);
      const matchingChildren = walk(category.children ?? [], level + 1);

      if (!categoryMatches && matchingChildren.length === 0) {
        return [];
      }

      const visibleChildren = categoryMatches
        ? flattenCategoriesForFilter(category.children ?? [], level + 1)
        : matchingChildren;

      return [{ category, level }, ...visibleChildren];
    });

  return walk(categories, 0);
};

type ProductsListFiltersPanelProps = {
  open: boolean;
  onClose: () => void;
};

export const ProductsListFiltersPanel = observer(
  ({ open, onClose }: ProductsListFiltersPanelProps) => {
    const { t } = useTranslation();
    const { token } = theme.useToken();
    const productsStore = useProductsStore();
    const categoriesStore = useCategoriesStore();
    const workspaceSettingsStore = useWorkspaceSettingsStore();
    const wishlistEnabled = workspaceSettingsStore.wishlistEnabled === true;
    const [categoryQuery, setCategoryQuery] = useState("");
    const filtersPanelWasOpenRef = useRef(false);

    const categoryFilterItems = useMemo(
      () => flattenCategoriesForFilter(categoriesStore.categories),
      [categoriesStore.categories],
    );

    const filteredCategoryItems = useMemo(
      () =>
        filterCategoriesForFilter(categoriesStore.categories, categoryQuery),
      [categoryQuery, categoriesStore.categories],
    );

    const allIds = useMemo(
      () => categoryFilterItems.map((item) => item.category.id),
      [categoryFilterItems],
    );
    const draftSet = useMemo(
      () => new Set(productsStore.draftCategoryIds),
      [productsStore.draftCategoryIds],
    );
    const allSelected =
      allIds.length > 0 && allIds.every((id) => draftSet.has(id));
    const someSelected =
      productsStore.draftCategoryIds.length > 0 && !allSelected;

    const appliedCategoryKey = useMemo(
      () => [...productsStore.listCategoryIds].sort((a, b) => a - b).join(","),
      [productsStore.listCategoryIds],
    );

    const byStatusOptions = useMemo(
      () =>
        PRODUCTS_LIST_BY_STATUS_VALUES.map((value) => ({
          value,
          label: t(`products.listFilters.byStatus.${value}`),
        })),
      [t],
    );

    const appliedCustomFieldsKey = useMemo(
      () =>
        productsStore.listCustomFieldFilters
          .map((filter) => {
            if (filter.mode === "all") {
              return `${filter.fieldId}:all`;
            }
            if (filter.mode === "options") {
              return `${filter.fieldId}:opts:${filter.optionIds.join(",")}`;
            }
            return `${filter.fieldId}:text:${filter.value}`;
          })
          .join("|"),
      [productsStore.listCustomFieldFilters],
    );

    useEffect(() => {
      if (!open) {
        filtersPanelWasOpenRef.current = false;
        return;
      }

      productsStore.syncFilterDraftFromApplied();
      if (!filtersPanelWasOpenRef.current) {
        setCategoryQuery("");
      }
      filtersPanelWasOpenRef.current = true;
    }, [
      open,
      productsStore,
      appliedCategoryKey,
      appliedCustomFieldsKey,
      productsStore.listByStatus,
      productsStore.listMinPrice,
      productsStore.listMaxPrice,
      productsStore.listQuantityFrom,
      productsStore.listQuantityTo,
      productsStore.listWishlistOnly,
      productsStore.listShowOnlyReserved,
    ]);

    const toggleCategory = (id: number, checked: boolean): void => {
      const next = new Set(productsStore.draftCategoryIds);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      productsStore.setDraftCategoryIds([...next]);
    };

    const toggleSelectAllCategories = (checked: boolean): void => {
      if (checked) {
        productsStore.setDraftCategoryIds([...allIds]);
      } else {
        productsStore.setDraftCategoryIds([]);
      }
    };

    const isMobileViewport = useIsMobileViewport();

    const filterContent = (
      <Flex
        vertical
        gap={16}
        style={{
          width: isMobileViewport ? "100%" : 360,
          maxWidth: isMobileViewport ? "100%" : "80vw",
        }}
      >
        <div>
          <Text strong style={{ display: "block", marginBottom: 8 }}>
            {t("products.toolbar.status")}
          </Text>
          <Segmented<ProductsListByStatus>
            block
            value={productsStore.draftByStatus}
            options={byStatusOptions}
            onChange={(value) => productsStore.setDraftByStatus(value)}
          />
        </div>

        <Divider style={{ margin: 0 }} />

        <div>
          <Text strong style={{ display: "block", marginBottom: 8 }}>
            {t("products.toolbar.category")}
          </Text>
          <Input
            allowClear
            placeholder={t(
              "products.listFilters.panelCategorySearchPlaceholder",
            )}
            prefix={<MagnifyingGlassIcon size={16} />}
            value={categoryQuery}
            onChange={(e) => setCategoryQuery(e.target.value)}
            style={{ marginBottom: 8 }}
          />
          <div
            style={{
              maxHeight: 220,
              overflowY: "auto",
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: token.borderRadius,
              padding: 8,
            }}
          >
            <div style={{ marginBottom: 8 }}>
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onChange={(e) => toggleSelectAllCategories(e.target.checked)}
              >
                {t("products.listFilters.panelSelectAll")}
              </Checkbox>
            </div>
            {filteredCategoryItems.map(({ category, level }) => (
              <div
                key={category.id}
                style={{
                  marginBottom: 4,
                  paddingLeft: level * CATEGORY_LEVEL_INDENT,
                }}
              >
                <Checkbox
                  checked={draftSet.has(category.id)}
                  onChange={(e) =>
                    toggleCategory(category.id, e.target.checked)
                  }
                >
                  {category.name}
                </Checkbox>
              </div>
            ))}
          </div>
        </div>

        <Divider style={{ margin: 0 }} />

        <div>
          <Text strong style={{ display: "block", marginBottom: 8 }}>
            {t("products.listFilters.panelPriceSection")}
          </Text>
          <Flex gap={8} align="center">
            <InputNumber
              style={{ flex: 1, minWidth: 0 }}
              placeholder={t("products.listFilters.panelPriceFrom")}
              min={0}
              value={productsStore.draftMinPrice ?? undefined}
              onChange={(v) => {
                productsStore.setDraftMinPrice(v == null ? null : Number(v));
              }}
            />
            <span>—</span>
            <InputNumber
              style={{ flex: 1, minWidth: 0 }}
              placeholder={t("products.listFilters.panelPriceTo")}
              min={0}
              value={productsStore.draftMaxPrice ?? undefined}
              onChange={(v) => {
                productsStore.setDraftMaxPrice(v == null ? null : Number(v));
              }}
            />
          </Flex>
        </div>

        <ProductsListCustomFieldFiltersSection
          fields={productsStore.variantCustomFields}
        />

        <Divider style={{ margin: 0 }} />

        <div>
          <Text strong style={{ display: "block", marginBottom: 8 }}>
            {t("products.listFilters.panelQuantitySection")}
          </Text>
          <Flex gap={8} align="center">
            <InputNumber
              style={{ flex: 1, minWidth: 0 }}
              placeholder={t("products.listFilters.panelQuantityFrom")}
              min={0}
              value={productsStore.draftQuantityFrom ?? undefined}
              onChange={(v) => {
                productsStore.setDraftQuantityFrom(
                  v == null ? null : Number(v),
                );
              }}
            />
            <span>—</span>
            <InputNumber
              style={{ flex: 1, minWidth: 0 }}
              placeholder={t("products.listFilters.panelQuantityTo")}
              min={0}
              value={productsStore.draftQuantityTo ?? undefined}
              onChange={(v) => {
                productsStore.setDraftQuantityTo(v == null ? null : Number(v));
              }}
            />
          </Flex>
        </div>

        {wishlistEnabled && (
          <>
            <Divider style={{ margin: 0 }} />

            <div>
              <Text strong style={{ display: "block", marginBottom: 8 }}>
                {t("products.listFilters.panelWishlistSection")}
              </Text>
              <Checkbox
                checked={productsStore.draftWishlistOnly}
                onChange={(e) =>
                  productsStore.setDraftWishlistOnly(e.target.checked)
                }
              >
                {t("products.listFilters.panelWishlistOnly")}
              </Checkbox>
            </div>
          </>
        )}

        <Divider style={{ margin: 0 }} />

        <div>
          <Text strong style={{ display: "block", marginBottom: 8 }}>
            {t("products.listFilters.panelReserveSection")}
          </Text>
          <Checkbox
            checked={productsStore.draftShowOnlyReserved}
            onChange={(e) =>
              productsStore.setDraftShowOnlyReserved(e.target.checked)
            }
          >
            {t("products.listFilters.panelShowOnlyReserved")}
          </Checkbox>
        </div>
      </Flex>
    );

    return (
      <Drawer
        title={t("products.toolbar.filters")}
        closable={{ placement: "end" }}
        open={open}
        placement={isMobileViewport ? "bottom" : "right"}
        size={isMobileViewport ? undefined : "auto"}
        height={isMobileViewport ? "auto" : undefined}
        onClose={onClose}
        destroyOnHidden
        data-qa={
          isMobileViewport ? "products-mobile-list-filters-drawer" : undefined
        }
        styles={{
          body: {
            padding: 16,
            overflowY: "auto",
            maxHeight: isMobileViewport ? "min(70vh, 560px)" : undefined,
          },
          footer: {
            padding: isMobileViewport
              ? "12px 16px calc(12px + env(safe-area-inset-bottom, 0px))"
              : 16,
          },
        }}
        footer={
          <Flex gap={8}>
            <Button
              style={{ flex: 1 }}
              onClick={() => productsStore.resetFilterDraft()}
            >
              {t("products.listFilters.panelClear")}
            </Button>
            <Button
              type="primary"
              style={{ flex: 1 }}
              icon={<FunnelSimpleIcon size={16} />}
              onClick={() => {
                if (!wishlistEnabled) {
                  productsStore.setDraftWishlistOnly(false);
                }
                productsStore.applyFiltersFromPanel();
                onClose();
              }}
            >
              {t("products.listFilters.panelApply")}
            </Button>
          </Flex>
        }
      >
        {filterContent}
      </Drawer>
    );
  },
);
