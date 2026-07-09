import { Empty, Spin } from "antd";
import { useTranslation } from "react-i18next";

import type { CatalogVariant } from "@/features/products/model/product.types";

import * as S from "../../orders-new-page.styled";
import { ProductSearchResultRow } from "./product-search-result-row";

type ProductSearchResultsProps = {
  loading: boolean;
  results: CatalogVariant[];
  selectedVariantIds: Set<number>;
  isSearchTooShort: boolean;
  onVariantSelect: (variant: CatalogVariant) => void;
};

export function ProductSearchResults({
  loading,
  results,
  selectedVariantIds,
  isSearchTooShort,
  onVariantSelect,
}: ProductSearchResultsProps) {
  const { t } = useTranslation();

  if (isSearchTooShort) {
    return <S.SearchResults />;
  }

  if (loading) {
    return (
      <S.SearchResults>
        <S.ProductSearchState>
          <Spin />
        </S.ProductSearchState>
      </S.SearchResults>
    );
  }

  if (results.length === 0) {
    return (
      <S.SearchResults>
        <S.ProductSearchState>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t("orders.create.products.empty")}
          />
        </S.ProductSearchState>
      </S.SearchResults>
    );
  }

  return (
    <S.SearchResults>
      {results.map((variant) => (
        <ProductSearchResultRow
          key={variant.id}
          variant={variant}
          selected={selectedVariantIds.has(variant.id)}
          onSelect={onVariantSelect}
        />
      ))}
    </S.SearchResults>
  );
}
