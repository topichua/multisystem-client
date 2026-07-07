import type { ReactNode } from "react";
import { Flex, Select, Spin, Typography } from "antd";
import { useTranslation } from "react-i18next";
import type { OrderDraftLine } from "@/features/orders/model/order.types";
import type { CatalogVariant } from "@/features/products/model/product.types";

import * as S from "./client-order-drawer.styled";
import { CatalogVariantSearchItem } from "./catalog-variant-search-item";
import { ClientOrderLinesTable } from "./client-order-lines-table";
import type { VariantSelectOptionData } from "./use-client-order-create-controller";

const { Text } = Typography;

type VariantSelectOption = {
  label: string;
  value: number;
  variant: CatalogVariant;
};

type ClientOrderProductsSectionProps = {
  catalogSearchLoading: boolean;
  minSearchLength: number;
  orderLines: OrderDraftLine[];
  productPickerKey: number;
  title: ReactNode;
  trimmedSearch: string;
  variantSelectOptions: VariantSelectOption[];
  onProductSearch: (value: string) => void;
  onQuantityChange: (variantId: number, quantity: number) => void;
  onRemoveLine: (variantId: number) => void;
  onVariantSelect: (variantId: number) => void;
};

export function ClientOrderProductsSection({
  catalogSearchLoading,
  minSearchLength,
  orderLines,
  productPickerKey,
  title,
  trimmedSearch,
  variantSelectOptions,
  onProductSearch,
  onQuantityChange,
  onRemoveLine,
  onVariantSelect,
}: ClientOrderProductsSectionProps) {
  const { t } = useTranslation();

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
      <S.ProductsPanel>
        <Select
          key={productPickerKey}
          showSearch={{
            onSearch: onProductSearch,
            filterOption: false,
          }}
          allowClear
          placeholder={t(
            "conversation.clientOrders.drawer.productSearchPlaceholder",
          )}
          loading={catalogSearchLoading}
          style={{ width: "100%" }}
          listHeight={320}
          options={variantSelectOptions}
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

            return <CatalogVariantSearchItem variant={data.variant} />;
          }}
        />

        <ClientOrderLinesTable
          orderLines={orderLines}
          onQuantityChange={onQuantityChange}
          onRemove={onRemoveLine}
        />
      </S.ProductsPanel>
    </S.Section>
  );
}
