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
import { memo } from "react";

import { CategoryTreeSelect } from "@/features/categories/components/category-tree-select";
import type { useCategoriesStore } from "@/features/categories/model/use-categories-store";
import type { CatalogVariant } from "@/features/products/model/product.types";

import type {
  SupplyPickerMode,
  VariantGroup,
} from "../stock-supply-modal.types";
import * as S from "../stock-supply-modal.styled";
import { SupplyVariantRow } from "./supply-variant-row";

const { Text } = Typography;

type StockSupplyVariantsPickerProps = {
  t: ReturnType<typeof import("react-i18next").useTranslation>["t"];
  categoriesStore: ReturnType<typeof useCategoriesStore>;
  variantsLoading: boolean;
  loadError: string | null;
  search: string;
  pickerMode: SupplyPickerMode;
  selectedCategoryId: number | null;
  filteredAvailableVariants: CatalogVariant[];
  groupedAvailableVariants: VariantGroup[];
  onSearchChange: (value: string) => void;
  onPickerModeChange: (mode: SupplyPickerMode) => void;
  onCategoryChange: (value: number | null) => void;
  onAddAll: () => void;
  onAddVariant: (variant: CatalogVariant) => void;
};

export const StockSupplyVariantsPicker = memo(
  function StockSupplyVariantsPicker({
    t,
    categoriesStore,
    variantsLoading,
    loadError,
    search,
    pickerMode,
    selectedCategoryId,
    filteredAvailableVariants,
    groupedAvailableVariants,
    onSearchChange,
    onPickerModeChange,
    onCategoryChange,
    onAddAll,
    onAddVariant,
  }: StockSupplyVariantsPickerProps) {
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
              onCategoryChange(typeof value === "number" ? value : null)
            }
          />
          <Segmented<SupplyPickerMode>
            value={pickerMode}
            aria-label={t("products.stockSupply.viewModeAria")}
            onChange={onPickerModeChange}
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
          onChange={(event) => onSearchChange(event.target.value)}
        />

        <S.VariantsList>
          {variantsLoading ? (
            <Flex align="center" justify="center" style={{ minHeight: 220 }}>
              <Spin />
            </Flex>
          ) : loadError ? (
            <Alert type="error" message={loadError} showIcon />
          ) : filteredAvailableVariants.length === 0 ? (
            <Flex align="center" justify="center" style={{ minHeight: 220 }}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={t("products.stockSupply.emptyVariants")}
              />
            </Flex>
          ) : pickerMode === "grouped" ? (
            groupedAvailableVariants.map((group) => (
              <div key={group.key} style={{ paddingTop: 12 }}>
                <Flex align="center" gap={6} style={{ padding: "0 8px 8px" }}>
                  <Text strong style={{ fontSize: 12 }}>
                    {group.productName}
                  </Text>
                  <S.CountPill>{group.variants.length}</S.CountPill>
                </Flex>
                {group.variants.map((variant) => (
                  <SupplyVariantRow
                    key={variant.id}
                    variant={variant}
                    onAdd={onAddVariant}
                  />
                ))}
              </div>
            ))
          ) : (
            filteredAvailableVariants.map((variant) => (
              <SupplyVariantRow
                key={variant.id}
                variant={variant}
                onAdd={onAddVariant}
              />
            ))
          )}
        </S.VariantsList>
      </S.VariantsColumn>
    );
  },
);
