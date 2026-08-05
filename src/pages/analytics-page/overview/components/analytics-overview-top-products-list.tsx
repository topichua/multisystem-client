import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { AnalyticsTopProducts } from "@/features/analytics/model/analytics.types";
import { formatMoney } from "@/features/orders/utils/format-money";
import { resolveProductImageSrc } from "@/features/products/utils/product-display";

import { getRankedListPercent } from "../utils/analytics-ranked-list.utils";

import { AnalyticsOverviewReportCard } from "./analytics-overview-report-card";
import * as S from "./analytics-overview-ranked-list.styled";

type AnalyticsOverviewTopProductsListProps = {
  data: AnalyticsTopProducts | null;
  loading?: boolean;
};

export const AnalyticsOverviewTopProductsList = ({
  data,
  loading = false,
}: AnalyticsOverviewTopProductsListProps) => {
  const { t } = useTranslation();

  const maxRevenue = useMemo(
    () =>
      Math.max(...(data?.products.map((product) => product.revenue) ?? [0]), 0),
    [data?.products],
  );

  const isEmpty = !data || data.products.length === 0;

  return (
    <AnalyticsOverviewReportCard
      title={t("analytics.overview.topProducts.title")}
      subtitle={t("analytics.overview.topProducts.subtitle")}
      dataQa="analytics-overview-top-products-list"
      loading={loading && isEmpty}
      isEmpty={!loading && isEmpty}
      contentVariant="list"
    >
      {data?.products.map((product) => (
        <S.Row key={`${product.productId}-${product.variantId}`}>
          <S.Media>
            <S.ProductImage
              src={resolveProductImageSrc(product.image)}
              alt={product.name}
            />
          </S.Media>

          <S.Content>
            <S.TopLine>
              <S.Name title={product.name}>{product.name}</S.Name>
              <S.Value>{formatMoney(product.revenue, "UAH")}</S.Value>
            </S.TopLine>

            <S.BottomLine>
              <S.ProgressTrack>
                <S.ProgressFill
                  $width={getRankedListPercent(product.revenue, maxRevenue)}
                />
              </S.ProgressTrack>
              <S.Meta>
                {t("analytics.overview.topProducts.quantity", {
                  count: product.soldQuantity,
                })}
              </S.Meta>
            </S.BottomLine>
          </S.Content>
        </S.Row>
      ))}
    </AnalyticsOverviewReportCard>
  );
};
