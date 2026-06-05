import {
  ArrowsDownUpIcon,
  CaretDownIcon,
  FunnelSimpleIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react";
import { Button, Flex, Input, Select, Tag, theme } from "antd";
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
import { ProductsListViewToggle } from "./products-list-view-toggle";

type ProductsListToolbarProps = {
  onToggleFilters: () => void;
};

export const ProductsListToolbar = observer(
  ({ onToggleFilters }: ProductsListToolbarProps) => {
    const { t } = useTranslation();
    const { token } = theme.useToken();
    const productsStore = useProductsStore();
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

    return (
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
            size="large"
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
            size="large"
            value={productsStore.listSort}
            options={sortOptions}
            onChange={(value) => productsStore.setListSort(value)}
            prefix={<ArrowsDownUpIcon size={18} />}
            suffixIcon={<CaretDownIcon size={14} />}
            popupMatchSelectWidth={false}
            style={{ minWidth: 240 }}
          />
          <Button size="large" type="default" onClick={onToggleFilters}>
            <Flex align="center" gap={8}>
              <FunnelSimpleIcon size={18} />
              {t("products.toolbar.filters")}
              {filterCount > 0 ? (
                <Tag
                  style={{
                    margin: 0,
                    lineHeight: "20px",
                    paddingInline: 8,
                    background: BRAND_PRIMARY,
                    color: token.colorTextLightSolid,
                    border: "none",
                  }}
                >
                  {filterCount}
                </Tag>
              ) : null}
            </Flex>
          </Button>
        </Flex>
      </Flex>
    );
  },
);
