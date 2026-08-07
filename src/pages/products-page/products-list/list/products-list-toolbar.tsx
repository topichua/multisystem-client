import {
  ArrowsDownUpIcon,
  CaretDownIcon,
  ExportIcon,
  FunnelSimpleIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react";
import { Badge, Button, Flex, Input, Select } from "antd";
import { observer } from "mobx-react-lite";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  PRODUCTS_LIST_SORT_VALUES,
  type ProductsListSort,
} from "@/features/products/model/product.types";
import { useProductsStore } from "@/features/products/model/use-products-store";

import { normalizeAppliedListKeyword } from "@/features/products/model/products-list-url";

import { BRAND_PRIMARY } from "@/styled/brand";
import { useIsMobileViewport } from "@/utils/use-media-query";
import { ProductsExportModal } from "./products-export-modal";
import { ProductsListViewToggle } from "./products-list-view-toggle";
import {
  useProductsExport,
  type ProductsExportController,
} from "./use-products-export";

type ProductsListToolbarProps = {
  onToggleFilters: () => void;
};

export const ProductsListToolbar = observer(
  ({ onToggleFilters }: ProductsListToolbarProps) => {
    const { t } = useTranslation();
    const isMobileViewport = useIsMobileViewport();
    const productsStore = useProductsStore();
    const productsExport: ProductsExportController = useProductsExport();
    const [keywordDraft, setKeywordDraft] = useState(
      () => productsStore.listKeyword,
    );
    const searchFocused = useRef(false);

    useLayoutEffect(() => {
      if (!searchFocused.current) {
        setKeywordDraft(productsStore.listKeyword);
      }
    }, [productsStore.listKeyword]);

    useEffect(() => {
      const id = window.setTimeout(() => {
        const nextApplied = normalizeAppliedListKeyword(keywordDraft);
        if (nextApplied !== productsStore.listKeyword) {
          productsStore.setListKeyword(keywordDraft);
        }
      }, 350);
      return () => window.clearTimeout(id);
    }, [keywordDraft, productsStore, productsStore.listKeyword]);

    const sortOptions = useMemo(
      () =>
        PRODUCTS_LIST_SORT_VALUES.map((value) => ({
          value,
          label: t(`products.listSort.${value}`),
        })),
      [t],
    );

    const filterCount = productsStore.appliedNonKeywordFilterCount;

    const exportModal = (
      <ProductsExportModal
        open={productsExport.open}
        submitting={productsExport.submitting}
        onCancel={productsExport.closeModal}
        onSubmit={(values) => {
          void productsExport.submit(values);
        }}
      />
    );

    if (isMobileViewport) {
      return (
        <>
          <Flex vertical gap={8} style={{ marginBottom: 12, width: "100%" }}>
            <Input
              allowClear
              placeholder={t("products.toolbar.searchPlaceholderMinChars")}
              aria-label={t("products.mobile.searchAria")}
              prefix={<MagnifyingGlassIcon size={18} />}
              value={keywordDraft}
              data-qa="products-mobile-list-search"
              onFocus={() => {
                searchFocused.current = true;
              }}
              onBlur={() => {
                searchFocused.current = false;
              }}
              onChange={(event) => setKeywordDraft(event.target.value)}
              style={{ width: "100%" }}
            />
            <Flex align="center" gap={8} style={{ width: "100%" }}>
              <Select<ProductsListSort>
                value={productsStore.listSort}
                options={sortOptions}
                onChange={(value) => productsStore.setListSort(value)}
                prefix={<ArrowsDownUpIcon size={18} />}
                suffixIcon={<CaretDownIcon size={14} />}
                popupMatchSelectWidth={false}
                aria-label={t("products.mobile.sortAria")}
                data-qa="products-mobile-list-sort"
                style={{ flex: "1 1 auto", minWidth: 0 }}
              />
              <Badge count={filterCount > 0 ? filterCount : 0} size="small">
                <Button
                  type="default"
                  icon={<FunnelSimpleIcon size={18} />}
                  aria-label={t("products.mobile.filtersAria")}
                  data-qa="products-mobile-list-filters"
                  onClick={onToggleFilters}
                >
                  {t("products.toolbar.filters")}
                </Button>
              </Badge>
              <Button
                type="default"
                icon={<ExportIcon size={18} />}
                aria-label={t("products.toolbar.export")}
                data-qa="products-mobile-export"
                onClick={productsExport.openModal}
              />
            </Flex>
          </Flex>
          {exportModal}
        </>
      );
    }

    return (
      <>
        <Flex
          align="center"
          gap={16}
          wrap="wrap"
          style={{ marginBottom: 16, width: "100%" }}
        >
          <ProductsListViewToggle />
          <div style={{ flex: "1 1 200px", minWidth: 0 }}>
            <Input
              allowClear
              placeholder={t("products.toolbar.searchPlaceholderMinChars")}
              prefix={<MagnifyingGlassIcon size={18} />}
              value={keywordDraft}
              onFocus={() => {
                searchFocused.current = true;
              }}
              onBlur={() => {
                searchFocused.current = false;
              }}
              onChange={(e) => setKeywordDraft(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>
          <Flex gap={12} align="center" wrap="wrap" style={{ flexShrink: 0 }}>
            <Select<ProductsListSort>
              value={productsStore.listSort}
              options={sortOptions}
              onChange={(value) => productsStore.setListSort(value)}
              prefix={<ArrowsDownUpIcon size={18} />}
              suffixIcon={<CaretDownIcon size={14} />}
              popupMatchSelectWidth={false}
              style={{ minWidth: 240 }}
            />
            <Button type="default" onClick={onToggleFilters}>
              <Flex align="center" gap={8}>
                <FunnelSimpleIcon size={18} />
                {t("products.toolbar.filters")}
                {filterCount > 0 && (
                  <Badge count={filterCount} color={BRAND_PRIMARY} />
                )}
              </Flex>
            </Button>
            <Button
              type="default"
              icon={<ExportIcon size={18} />}
              data-qa="products-list-export"
              onClick={productsExport.openModal}
            >
              {t("products.toolbar.export")}
            </Button>
          </Flex>
        </Flex>
        {exportModal}
      </>
    );
  },
);
