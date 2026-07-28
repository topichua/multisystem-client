import {
  CaretDownIcon,
  CaretRightIcon,
  FolderIcon,
  FolderOpenIcon,
  PencilSimpleIcon,
  PlusIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { Button, Popconfirm } from "antd";
import type { MouseEvent } from "react";
import { useTranslation } from "react-i18next";

import { isUncategorizedCategory } from "@/features/categories/model/category.constants";
import type { Category } from "@/features/categories/model/category.types";

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
  onToggle: (categoryId: number) => void;
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
  onToggle,
}: CategoryTreeTitleProps) => {
  const { t } = useTranslation();
  const canManageCategory = !isUncategorizedCategory(category);

  const stopActionClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
  };

  const handleAddSubcategoryClick = (event: MouseEvent<HTMLElement>) => {
    stopActionClick(event);
    onAddSubcategory(category.id);
  };

  const handleEditCategoryClick = (event: MouseEvent<HTMLElement>) => {
    stopActionClick(event);
    onEditCategory(category);
  };

  const handleRowClick = () => {
    if (expandable) {
      onToggle(category.id);
    }
  };

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

      <S.CategoryName title={category.name}>{category.name}</S.CategoryName>

      <S.CategoryProductsCount>{category.productCount}</S.CategoryProductsCount>

      <S.CategoryActions data-category-actions>
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
        <Popconfirm
          title={t("categories.deleteConfirm")}
          description={t("categories.deleteWarning")}
          okText={t("categories.delete")}
          cancelText={t("categories.cancel")}
          okButtonProps={{ danger: true }}
          onConfirm={() => void onDeleteCategory(category)}
          placement="left"
        >
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
        </Popconfirm>
      </S.CategoryActions>
    </S.CategoryRow>
  );
};
