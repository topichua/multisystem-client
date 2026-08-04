import { FunnelSimpleIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import {
  Button,
  Checkbox,
  Drawer,
  Flex,
  Input,
  InputNumber,
  Select,
  Typography,
  theme,
} from "antd";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import type { Category } from "@/features/categories/model/category.types";
import { useCategoriesStore } from "@/features/categories/model/use-categories-store";
import { useProductsStore } from "@/features/products/model/use-products-store";
import { useIsMobileViewport } from "@/utils/use-media-query";

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
      productsStore.listStatus,
      productsStore.listMinPrice,
      productsStore.listMaxPrice,
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
        gap={20}
        style={{
          width: isMobileViewport ? "100%" : 360,
          maxWidth: isMobileViewport ? "100%" : "80vw",
        }}
      >
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
              borderRadius: 8,
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

        <div>
          <Text strong style={{ display: "block", marginBottom: 8 }}>
            {t("products.toolbar.status")}
          </Text>
          <Select
            style={{ width: "100%" }}
            value={productsStore.draftStatus ?? ""}
            options={[
              { value: "", label: t("products.toolbar.allStatuses") },
              { value: "draft", label: t("products.toolbar.statusDraft") },
              { value: "active", label: t("products.toolbar.statusActive") },
              {
                value: "archived",
                label: t("products.toolbar.statusArchived"),
              },
            ]}
            onChange={(v) =>
              productsStore.setDraftStatus(
                v === undefined || v === null || v === "" ? null : String(v),
              )
            }
          />
        </div>

        <div>
          <Text strong style={{ display: "block", marginBottom: 8 }}>
            {t("products.listFilters.panelPriceSection")}
          </Text>
          <Flex gap={8} align="center">
            <InputNumber
              style={{ flex: 1, minWidth: 0 }}
              placeholder={t("products.listFilters.panelPriceFrom")}
              value={productsStore.draftMinPrice ?? undefined}
              onChange={(v) => {
                if (v == null) {
                  productsStore.setDraftMinPrice(null);
                } else {
                  productsStore.setDraftMinPrice(Number(v));
                }
              }}
            />
            <span>-</span>
            <InputNumber
              style={{ flex: 1, minWidth: 0 }}
              placeholder={t("products.listFilters.panelPriceTo")}
              value={productsStore.draftMaxPrice ?? undefined}
              onChange={(v) => {
                if (v == null) {
                  productsStore.setDraftMaxPrice(null);
                } else {
                  productsStore.setDraftMaxPrice(Number(v));
                }
              }}
            />
          </Flex>
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
