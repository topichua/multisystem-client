import {
  ArrowLeftIcon,
  CaretRightIcon,
  FolderIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import { Empty } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { useNavigate, useOutletContext } from "react-router";

import { getProductCategoryPath, pagesMap } from "@/app/router/pages-map";
import { CenteredSpinner } from "@/components/loading/centered-spinner";
import { countCategoryDescendants } from "@/features/categories/model/category-tree";
import { useCategoriesStore } from "@/features/categories/model/use-categories-store";

import type { ProductsCategoriesOutletContext } from "../products-categories-layout";
import * as S from "./mobile-categories-list-page.styled";

export const MobileCategoriesListPage = observer(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const store = useCategoriesStore();
  const {
    onCreateClick,
    searchValue,
    setSearchValue,
    visibleCategories,
    totalCount,
  } = useOutletContext<ProductsCategoriesOutletContext>();

  const emptyDescription =
    totalCount === 0 ? t("categories.emptyState") : t("categories.emptySearch");

  return (
    <S.Root>
      <S.Header>
        <S.HeaderTopRow>
          <S.TitleRow>
            <S.BackButton
              type="text"
              icon={<ArrowLeftIcon size={20} />}
              aria-label={t("products.mobile.backToProductsAria")}
              data-qa="products-mobile-categories-back"
              onClick={() => navigate(pagesMap.products)}
            />
            <S.TitleCopy>
              <S.PageTitle level={3}>{t("categories.title")}</S.PageTitle>
              <S.PageSubtitle>
                {t("categories.itemsCount", { count: totalCount })}
              </S.PageSubtitle>
            </S.TitleCopy>
          </S.TitleRow>
          <S.CreateButton
            type="primary"
            icon={<PlusIcon />}
            aria-label={t("categories.mobile.createCategoryAria")}
            data-qa="products-mobile-categories-create"
            onClick={onCreateClick}
          >
            <S.CreateButtonLabel>
              {t("categories.createCategory")}
            </S.CreateButtonLabel>
          </S.CreateButton>
        </S.HeaderTopRow>

        <S.SearchInput
          allowClear
          placeholder={t("categories.searchPlaceholder")}
          aria-label={t("categories.searchPlaceholder")}
          value={searchValue}
          data-qa="products-mobile-categories-search"
          onChange={(event) => setSearchValue(event.target.value)}
        />
      </S.Header>

      {store.listLoading && totalCount === 0 ? (
        <S.StateContainer>
          <CenteredSpinner minHeight={160} />
        </S.StateContainer>
      ) : visibleCategories.length === 0 ? (
        <S.StateContainer>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={emptyDescription}
          />
        </S.StateContainer>
      ) : (
        <S.ListCard>
          {visibleCategories.map((category) => {
            const subcategoriesCount = countCategoryDescendants(category);

            return (
              <S.CategoryItemButton
                key={category.id}
                type="text"
                block
                data-qa={`products-mobile-category-item-${category.id}`}
                aria-label={category.name}
                onClick={() => navigate(getProductCategoryPath(category.id))}
              >
                <S.ItemContent align="center" gap={12}>
                  <S.IconTile aria-hidden="true">
                    <FolderIcon />
                  </S.IconTile>
                  <S.ItemCopy vertical gap={2}>
                    <S.ItemTitle>{category.name}</S.ItemTitle>
                    <S.ItemMeta>
                      {t("categories.subcategoriesCount", {
                        count: subcategoriesCount,
                      })}
                    </S.ItemMeta>
                  </S.ItemCopy>
                  <S.Caret aria-hidden="true">
                    <CaretRightIcon size={18} />
                  </S.Caret>
                </S.ItemContent>
              </S.CategoryItemButton>
            );
          })}
        </S.ListCard>
      )}
    </S.Root>
  );
});
