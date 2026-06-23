import { Button, Flex, Typography } from "antd";
import { Tag } from "@/components/tag/tag";
import type { TFunction } from "i18next";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

import { useProductsStore } from "@/features/products/model/use-products-store";

const { Text } = Typography;

function productStatusFilterLabel(t: TFunction, status: string): string {
  if (status === "draft") {
    return t("products.toolbar.statusDraft");
  }
  if (status === "active") {
    return t("products.toolbar.statusActive");
  }
  if (status === "archived") {
    return t("products.toolbar.statusArchived");
  }
  return status;
}

type ProductsListActiveFiltersProps = {
  categoryNameById: Map<number, string>;
};

export const ProductsListActiveFilters = observer(
  ({ categoryNameById }: ProductsListActiveFiltersProps) => {
    const { t } = useTranslation();
    const productsStore = useProductsStore();

    const hasKeyword = Boolean(productsStore.listKeyword);
    const hasCategories = productsStore.listCategoryIds.length > 0;
    const hasStatus = Boolean(productsStore.listStatus);
    const hasMin = productsStore.listMinPrice != null;
    const hasMax = productsStore.listMaxPrice != null;
    const hasPrice = hasMin || hasMax;
    const hasSort = productsStore.listSort !== "created_desc";

    if (!hasKeyword && !hasCategories && !hasStatus && !hasPrice && !hasSort) {
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

    return (
      <Flex align="center" gap={24} wrap="wrap" style={{ marginBottom: 12 }}>
        <Text strong style={{ display: "block" }}>
          {t("products.listFilters.activeTitle")}
        </Text>
        <Flex gap={8} wrap="wrap" align="center">
          {hasKeyword ? (
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
          ) : null}
          {hasSort ? (
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
          ) : null}
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
          {hasStatus && productsStore.listStatus ? (
            <Tag
              closable
              onClose={() => {
                productsStore.clearListStatus();
              }}
              color="purple"
            >
              {t("products.listFilters.tagStatus", {
                label: productStatusFilterLabel(t, productsStore.listStatus),
              })}
            </Tag>
          ) : null}
          {hasPrice ? (
            <Tag
              closable
              onClose={() => {
                productsStore.clearListPriceRange();
              }}
              color="purple"
            >
              {priceLabel}
            </Tag>
          ) : null}
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
