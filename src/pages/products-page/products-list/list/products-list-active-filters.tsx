import { Button, Flex, Typography } from "antd";
import { Tag } from "@/components/tag/tag";
import type { TFunction } from "i18next";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { VariantCustomField } from "@/features/products/model/product-create-api.types";
import {
  PRODUCTS_LIST_BY_STATUS_DEFAULT,
  type ProductsListByStatus,
} from "@/features/products/model/product.types";
import type { ProductsListCustomFieldFilter } from "@/features/products/model/products-list-custom-field-filters";
import { useProductsStore } from "@/features/products/model/use-products-store";
import { useWorkspaceSettingsStore } from "@/features/workspace-settings/model/use-workspace-settings-store";
import { InventoryMode } from "@/features/workspace-settings/model/workspace-settings.types";

const { Text } = Typography;

function byStatusFilterLabel(
  t: TFunction,
  byStatus: ProductsListByStatus,
): string {
  return t(`products.listFilters.byStatus.${byStatus}`);
}

function fieldDisplayLabel(
  field: VariantCustomField | undefined,
  fieldId: number,
): string {
  if (!field) {
    return String(fieldId);
  }
  const displayName = field.displayName?.trim();
  return displayName || field.label;
}

function customFieldFilterTagLabel(
  t: TFunction,
  filter: ProductsListCustomFieldFilter,
  fieldById: Map<number, VariantCustomField>,
): string {
  const field = fieldById.get(filter.fieldId);
  const name = fieldDisplayLabel(field, filter.fieldId);

  if (filter.mode === "all") {
    return t("products.listFilters.tagFieldAny", { name });
  }

  if (filter.mode === "text") {
    return t("products.listFilters.tagFieldText", {
      name,
      value: filter.value,
    });
  }

  const optionLabelById = new Map(
    (field?.options ?? []).map((option) => [option.id, option.label]),
  );
  const optionLabels = filter.optionIds.map(
    (id) =>
      optionLabelById.get(id) ??
      t("products.listFilters.tagFieldOptionFallback", { id }),
  );

  return t("products.listFilters.tagFieldOptions", {
    name,
    values: optionLabels.join(", "),
  });
}

type ProductsListActiveFiltersProps = {
  categoryNameById: Map<number, string>;
};

export const ProductsListActiveFilters = observer(
  ({ categoryNameById }: ProductsListActiveFiltersProps) => {
    const { t } = useTranslation();
    const productsStore = useProductsStore();
    const workspaceSettingsStore = useWorkspaceSettingsStore();

    const fieldById = useMemo(
      () =>
        new Map(
          productsStore.variantCustomFields.map((field) => [field.id, field]),
        ),
      [productsStore.variantCustomFields],
    );

    const hasKeyword = Boolean(productsStore.listKeyword);
    const hasCategories = productsStore.listCategoryIds.length > 0;
    const hasByStatus =
      productsStore.listByStatus !== PRODUCTS_LIST_BY_STATUS_DEFAULT;
    const hasMin = productsStore.listMinPrice != null;
    const hasMax = productsStore.listMaxPrice != null;
    const hasPrice = hasMin || hasMax;
    const hasQtyFrom = productsStore.listQuantityFrom != null;
    const hasQtyTo = productsStore.listQuantityTo != null;
    const hasQuantity = hasQtyFrom || hasQtyTo;
    const hasWishlist =
      productsStore.listWishlistOnly &&
      workspaceSettingsStore.wishlistEnabled === true;
    const hasReserved =
      productsStore.listShowOnlyReserved &&
      workspaceSettingsStore.inventoryMode === InventoryMode.advanced;
    const hasSort = productsStore.listSort !== "created_desc";
    const hasCustomFields = productsStore.listCustomFieldFilters.length > 0;

    if (
      !hasKeyword &&
      !hasCategories &&
      !hasByStatus &&
      !hasPrice &&
      !hasQuantity &&
      !hasWishlist &&
      !hasReserved &&
      !hasSort &&
      !hasCustomFields
    ) {
      return null;
    }

    const priceLabel =
      hasMin && hasMax
        ? t("products.listFilters.tagPriceRange", {
            min: productsStore.listMinPrice,
            max: productsStore.listMaxPrice,
          })
        : hasMin
          ? t("products.listFilters.tagPriceMin", {
              min: productsStore.listMinPrice,
            })
          : t("products.listFilters.tagPriceMax", {
              max: productsStore.listMaxPrice,
            });

    const quantityLabel =
      hasQtyFrom && hasQtyTo
        ? t("products.listFilters.tagQuantityRange", {
            min: productsStore.listQuantityFrom,
            max: productsStore.listQuantityTo,
          })
        : hasQtyFrom
          ? t("products.listFilters.tagQuantityMin", {
              min: productsStore.listQuantityFrom,
            })
          : t("products.listFilters.tagQuantityMax", {
              max: productsStore.listQuantityTo,
            });

    return (
      <Flex align="center" gap={24} wrap="wrap" style={{ marginBottom: 12 }}>
        <Text strong style={{ display: "block" }}>
          {t("products.listFilters.activeTitle")}
        </Text>
        <Flex gap={8} wrap="wrap" align="center">
          {hasKeyword && (
            <Tag
              closable
              onClose={() => {
                productsStore.clearListKeyword();
              }}
              color="purple"
            >
              {t("products.listFilters.tagSearch", {
                keyword: productsStore.listKeyword,
              })}
            </Tag>
          )}
          {hasSort && (
            <Tag
              closable
              onClose={() => {
                productsStore.resetListSortToDefault();
              }}
              color="purple"
            >
              {t("products.listFilters.tagSort", {
                label: t(`products.listSort.${productsStore.listSort}`),
              })}
            </Tag>
          )}
          {productsStore.listCategoryIds.map((id) => (
            <Tag
              key={id}
              closable
              onClose={() => {
                productsStore.removeListCategoryId(id);
              }}
              color="purple"
            >
              {t("products.listFilters.tagCategory", {
                name:
                  categoryNameById.get(id) ??
                  t("products.listFilters.tagCategoryFallback", { id }),
              })}
            </Tag>
          ))}
          {hasByStatus && (
            <Tag
              closable
              onClose={() => {
                productsStore.clearListByStatus();
              }}
              color="purple"
            >
              {t("products.listFilters.tagStatus", {
                label: byStatusFilterLabel(t, productsStore.listByStatus),
              })}
            </Tag>
          )}
          {hasPrice && (
            <Tag
              closable
              onClose={() => {
                productsStore.clearListPriceRange();
              }}
              color="purple"
            >
              {priceLabel}
            </Tag>
          )}
          {hasQuantity && (
            <Tag
              closable
              onClose={() => {
                productsStore.clearListQuantityRange();
              }}
              color="purple"
            >
              {quantityLabel}
            </Tag>
          )}
          {hasWishlist && (
            <Tag
              closable
              onClose={() => {
                productsStore.clearListWishlistOnly();
              }}
              color="purple"
            >
              {t("products.listFilters.tagWishlistOnly")}
            </Tag>
          )}
          {hasReserved && (
            <Tag
              closable
              onClose={() => {
                productsStore.clearListShowOnlyReserved();
              }}
              color="purple"
            >
              {t("products.listFilters.tagShowOnlyReserved")}
            </Tag>
          )}
          {productsStore.listCustomFieldFilters.map((filter) => (
            <Tag
              key={filter.fieldId}
              closable
              onClose={() => {
                productsStore.removeListCustomFieldFilter(filter.fieldId);
              }}
              color="purple"
            >
              {customFieldFilterTagLabel(t, filter, fieldById)}
            </Tag>
          ))}
          <Button
            type="link"
            size="small"
            onClick={() => productsStore.clearAllListFilters()}
          >
            {t("products.listFilters.clearAll")}
          </Button>
        </Flex>
      </Flex>
    );
  },
);
