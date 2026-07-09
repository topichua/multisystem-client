import { MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";
import { Button, Input, Typography } from "antd";
import { useTranslation } from "react-i18next";

import type { CatalogVariant } from "@/features/products/model/product.types";

import { MIN_PRODUCT_SEARCH_LENGTH } from "../../orders-new.constants";
import * as S from "../../orders-new-page.styled";
import { ProductSearchResults } from "./product-search-results";

const { Text } = Typography;

type ProductSearchContentProps = {
  value: string;
  loading: boolean;
  results: CatalogVariant[];
  selectedVariantIds: Set<number>;
  trimmedSearch: string;
  onClose: () => void;
  onChange: (value: string) => void;
  onVariantSelect: (variant: CatalogVariant) => void;
};

export function ProductSearchContent({
  value,
  loading,
  results,
  selectedVariantIds,
  trimmedSearch,
  onClose,
  onChange,
  onVariantSelect,
}: ProductSearchContentProps) {
  const { t } = useTranslation();
  const isSearchTooShort = trimmedSearch.length < MIN_PRODUCT_SEARCH_LENGTH;

  return (
    <S.ProductSearchContent>
      <Input
        autoFocus
        prefix={<MagnifyingGlassIcon size={16} />}
        suffix={
          <Button
            type="text"
            size="small"
            icon={<XIcon size={14} />}
            aria-label={t("orders.create.products.closeSearch")}
            onClick={onClose}
          />
        }
        value={value}
        placeholder={t("orders.create.products.searchPlaceholder")}
        onChange={(event) => onChange(event.target.value)}
      />

      <Text
        type="secondary"
        strong
        style={{
          display: "block",
          marginTop: 10,
          fontSize: 12,
          textTransform: "uppercase",
        }}
      >
        {isSearchTooShort
          ? t("orders.create.products.searchMinChars", {
              count: MIN_PRODUCT_SEARCH_LENGTH,
            })
          : t("orders.create.products.found", {
              count: results.length,
            })}
      </Text>

      <ProductSearchResults
        loading={loading}
        results={results}
        selectedVariantIds={selectedVariantIds}
        isSearchTooShort={isSearchTooShort}
        onVariantSelect={onVariantSelect}
      />
    </S.ProductSearchContent>
  );
}
