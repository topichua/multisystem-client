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
} from "antd";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { flattenCategories } from "@/features/categories/model/category-tree";
import { useCategoriesStore } from "@/features/categories/model/use-categories-store";
import { useProductsStore } from "@/features/products/model/use-products-store";

const { Text } = Typography;

type ProductsListFiltersPanelProps = {
  open: boolean;
  onClose: () => void;
};

export const ProductsListFiltersPanel = observer(
  ({ open, onClose }: ProductsListFiltersPanelProps) => {
    const { t } = useTranslation();
    const productsStore = useProductsStore();
    const categoriesStore = useCategoriesStore();
    const [categoryQuery, setCategoryQuery] = useState("");
    const filtersPanelWasOpenRef = useRef(false);

    const flatCategories = useMemo(
      () => flattenCategories(categoriesStore.categories),
      [categoriesStore.categories],
    );

    const filteredCategories = useMemo(() => {
      const q = categoryQuery.trim().toLowerCase();
      if (!q) {
        return flatCategories;
      }
      return flatCategories.filter((c) => c.name.toLowerCase().includes(q));
    }, [categoryQuery, flatCategories]);

    const allIds = useMemo(
      () => flatCategories.map((c) => c.id),
      [flatCategories],
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

    return (
      <Drawer
        title={t("products.toolbar.filters")}
        open={open}
        placement="right"
        width="auto"
        onClose={onClose}
        destroyOnHidden
        styles={{
          body: {
            padding: 16,
            overflowY: "auto",
          },
          footer: {
            padding: 16,
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
        <Flex vertical gap={20} style={{ width: 360, maxWidth: "80vw" }}>
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
                border: "1px solid #f0f0f0",
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
              {filteredCategories.map((c) => (
                <div key={c.id} style={{ marginBottom: 4 }}>
                  <Checkbox
                    checked={draftSet.has(c.id)}
                    onChange={(e) => toggleCategory(c.id, e.target.checked)}
                  >
                    {c.name}
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
              <span>–</span>
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
      </Drawer>
    );
  },
);
