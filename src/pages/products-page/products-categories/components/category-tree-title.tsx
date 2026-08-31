import {
  CaretDownIcon,
  CaretRightIcon,
  DotsThreeIcon,
  FolderIcon,
  FolderOpenIcon,
  PencilSimpleIcon,
  PlusIcon,
  SwapIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { Button, Dropdown, Flex, Popconfirm, Typography, theme } from "antd";
import type { MouseEvent } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { isUncategorizedCategory } from "@/features/categories/model/category.constants";
import type { Category } from "@/features/categories/model/category.types";
import { useIsMobileViewport } from "@/utils/use-media-query";

import * as S from "./products-categories-tree.styled";

type CategoryTreeTitleProps = {
  category: Category;
  expandable: boolean;
  expanded: boolean;
  selected: boolean;
  deleteLoading: boolean;
  onAddSubcategory: (parentCategoryId: number) => void;
  onDeleteCategory: (category: Category) => Promise<void>;
  onEditCategory: (category: Category) => void;
  onMoveCategory: (category: Category) => void;
  onToggle: (categoryId: number) => void;
};

const { Text } = Typography;

const stopActionClick = (event: MouseEvent<HTMLElement>) => {
  event.stopPropagation();
};

export const CategoryTreeTitle = ({
  category,
  expandable,
  expanded,
  selected,
  deleteLoading,
  onAddSubcategory,
  onDeleteCategory,
  onEditCategory,
  onMoveCategory,
  onToggle,
}: CategoryTreeTitleProps) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const isMobileViewport = useIsMobileViewport();
  const [menuOpen, setMenuOpen] = useState(false);
  const canManageCategory = !isUncategorizedCategory(category);

  const handleAddSubcategoryClick = (event: MouseEvent<HTMLElement>) => {
    stopActionClick(event);
    setMenuOpen(false);
    onAddSubcategory(category.id);
  };

  const handleEditCategoryClick = (event: MouseEvent<HTMLElement>) => {
    stopActionClick(event);
    setMenuOpen(false);
    onEditCategory(category);
  };

  const handleMoveCategoryClick = (event: MouseEvent<HTMLElement>) => {
    stopActionClick(event);
    setMenuOpen(false);
    onMoveCategory(category);
  };

  const handleRowClick = () => {
    if (expandable) {
      onToggle(category.id);
    }
  };

  const productsCount =
    category.productCount > 0 || category.productVariantCount > 0 ? (
      <S.CategoryProductsCount>
        <Text strong>{category.productCount}</Text>{" "}
        {t("categories.productsWord", { count: category.productCount })}
        {", "}
        <Text strong>{category.productVariantCount}</Text>{" "}
        {t("categories.productVariantsWord", {
          count: category.productVariantCount,
        })}
      </S.CategoryProductsCount>
    ) : (
      <S.CategoryProductsCount>
        {t("categories.noLinkedProducts")}
      </S.CategoryProductsCount>
    );

  const deleteConfirm = (
    <Popconfirm
      title={t("categories.deleteConfirm")}
      description={
        category.children.length > 0
          ? t("categories.deleteCascadeWarning")
          : t("categories.deleteWarning")
      }
      okText={t("categories.delete")}
      cancelText={t("categories.cancel")}
      okButtonProps={{ danger: true }}
      onConfirm={() => void onDeleteCategory(category)}
      placement="left"
    >
      {isMobileViewport ? (
        <Button
          danger
          type="text"
          block
          loading={deleteLoading}
          icon={<TrashIcon size={16} />}
          style={{ justifyContent: "flex-start" }}
          aria-label={t("categories.delete")}
          onClick={stopActionClick}
        >
          {t("categories.delete")}
        </Button>
      ) : (
        <Button
          type="text"
          size="small"
          danger
          loading={deleteLoading}
          icon={<TrashIcon size={16} />}
          aria-label={t("categories.delete")}
          onClick={stopActionClick}
          disabled={!canManageCategory}
          style={{ opacity: !canManageCategory ? 0 : 1 }}
        />
      )}
    </Popconfirm>
  );

  const desktopActions = (
    <>
      <Button
        type="text"
        size="small"
        icon={<PlusIcon size={16} />}
        aria-label={t("categories.mobile.addSubcategoryAria")}
        onClick={handleAddSubcategoryClick}
        disabled={!canManageCategory}
        style={{ opacity: !canManageCategory ? 0 : 1 }}
      />
      <Button
        type="text"
        size="small"
        icon={<PencilSimpleIcon size={16} />}
        aria-label={t("categories.renameCategory")}
        onClick={handleEditCategoryClick}
        disabled={!canManageCategory}
        style={{ opacity: !canManageCategory ? 0 : 1 }}
      />
      <Button
        type="text"
        size="small"
        icon={<SwapIcon size={16} />}
        aria-label={t("categories.moveCategory")}
        onClick={handleMoveCategoryClick}
        disabled={!canManageCategory}
        style={{ opacity: !canManageCategory ? 0 : 1 }}
      />
      {deleteConfirm}
    </>
  );

  const mobileActions = canManageCategory ? (
    <div
      onClick={stopActionClick}
      onMouseDown={stopActionClick}
      onPointerDown={stopActionClick}
    >
      <Dropdown
        open={menuOpen}
        trigger={["click"]}
        placement="bottomRight"
        menu={{ items: [] }}
        popupRender={() => (
          <Flex
            vertical
            gap={4}
            style={{
              padding: 4,
              borderRadius: token.borderRadius,
              background: token.colorBgElevated,
              boxShadow: token.boxShadowSecondary,
            }}
            onClick={stopActionClick}
            onMouseDown={stopActionClick}
          >
            <Button
              type="text"
              block
              icon={<PlusIcon size={16} />}
              style={{ justifyContent: "flex-start" }}
              onClick={handleAddSubcategoryClick}
            >
              {t("categories.addSubcategory")}
            </Button>
            <Button
              type="text"
              block
              icon={<PencilSimpleIcon size={16} />}
              style={{ justifyContent: "flex-start" }}
              onClick={handleEditCategoryClick}
            >
              {t("categories.renameCategory")}
            </Button>
            <Button
              type="text"
              block
              icon={<SwapIcon size={16} />}
              style={{ justifyContent: "flex-start" }}
              onClick={handleMoveCategoryClick}
            >
              {t("categories.moveCategory")}
            </Button>
            {deleteConfirm}
          </Flex>
        )}
        onOpenChange={setMenuOpen}
      >
        <Button
          type="text"
          size="small"
          loading={deleteLoading}
          icon={<DotsThreeIcon size={24} />}
          aria-label={t("categories.mobile.actionsAria")}
          aria-expanded={menuOpen}
          data-qa="categories-mobile-tree-actions"
        />
      </Dropdown>
    </div>
  ) : null;

  return (
    <S.CategoryRow
      $clickable={expandable}
      $selected={selected}
      aria-expanded={expandable ? expanded : undefined}
      role={expandable ? "button" : undefined}
      tabIndex={expandable ? 0 : undefined}
      onClick={handleRowClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleRowClick();
        }
      }}
    >
      <S.CategoryCaret aria-hidden="true">
        {expandable &&
          (expanded ? (
            <CaretDownIcon size={14} />
          ) : (
            <CaretRightIcon size={14} />
          ))}
      </S.CategoryCaret>

      <S.CategoryIcon aria-hidden="true">
        {expanded ? <FolderOpenIcon size={16} /> : <FolderIcon size={16} />}
      </S.CategoryIcon>

      <S.CategoryMain>
        <S.CategoryName
          $hasChildren={expandable}
          title={category.name}
          style={{
            color: !canManageCategory ? "grey" : undefined,
          }}
        >
          {category.name}
        </S.CategoryName>
        {productsCount}
      </S.CategoryMain>

      <S.CategoryActions data-category-actions>
        {isMobileViewport ? mobileActions : desktopActions}
      </S.CategoryActions>
    </S.CategoryRow>
  );
};
