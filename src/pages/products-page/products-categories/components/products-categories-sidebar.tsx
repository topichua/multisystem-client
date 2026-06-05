import { CaretRightIcon, FolderIcon, PlusIcon } from "@phosphor-icons/react";
import { Button, Empty, Flex, Input, Typography } from "antd";
import { useTranslation } from "react-i18next";

import {
  PaneScrollRegion,
  PaneSectionHeaderStack,
  PaneSectionTitle,
} from "@/components/layout/pane-frame";
import { PaneNavSplitLayout } from "@/components/layout/pane-nav-split-layout";
import { countCategoryDescendants } from "@/features/categories/model/category-tree";
import type { Category } from "@/features/categories/model/category.types";

import * as S from "../products-categories-layout.styled";

const { Text } = Typography;

type ProductsCategoriesSidebarProps = {
  categories: Category[];
  totalCount: number;
  activeCategoryId: number | null;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onCreateClick: () => void;
  onCategoryClick: (categoryId: number) => void;
};

export const ProductsCategoriesSidebar = ({
  categories,
  totalCount,
  activeCategoryId,
  searchValue,
  onSearchChange,
  onCreateClick,
  onCategoryClick,
}: ProductsCategoriesSidebarProps) => {
  const { t } = useTranslation();
  const emptyDescription =
    totalCount === 0 ? t("categories.emptyState") : t("categories.emptySearch");

  return (
    <PaneNavSplitLayout.SubSidebar data-qa="layout-products-categories-sidebar">
      <PaneSectionHeaderStack data-qa="layout-products-categories-header">
        <Flex align="center" justify="space-between" gap={12}>
          <div>
            <PaneSectionTitle>{t("categories.title")}</PaneSectionTitle>
            <Text type="secondary">
              {t("categories.itemsCount", { count: totalCount })}
            </Text>
          </div>

          <Button type="primary" icon={<PlusIcon />} onClick={onCreateClick}>
            {t("categories.createCategory")}
          </Button>
        </Flex>

        <Input.Search
          allowClear
          placeholder={t("categories.searchPlaceholder")}
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </PaneSectionHeaderStack>

      <PaneScrollRegion data-qa="layout-products-categories-nav-scroll">
        <div data-qa="layout-products-categories-nav">
          {categories.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={emptyDescription}
            />
          ) : (
            categories.map((category) => {
              const isActive = category.id === activeCategoryId;
              const subcategoriesCount = countCategoryDescendants(category);

              return (
                <S.CategoryNavItem
                  key={category.id}
                  type="button"
                  $active={isActive}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => onCategoryClick(category.id)}
                >
                  <Flex align="center" gap={12}>
                    <S.CategoryNavIcon $active={isActive}>
                      <FolderIcon size={18} />
                    </S.CategoryNavIcon>

                    <Flex vertical flex={1} style={{ minWidth: 0 }}>
                      <Text strong ellipsis={{ tooltip: category.name }}>
                        {category.name}
                      </Text>

                      <Text type="secondary">
                        {t("categories.subcategoriesCount", {
                          count: subcategoriesCount,
                        })}
                      </Text>
                    </Flex>

                    <CaretRightIcon size={16} />
                  </Flex>
                </S.CategoryNavItem>
              );
            })
          )}
        </div>
      </PaneScrollRegion>
    </PaneNavSplitLayout.SubSidebar>
  );
};
