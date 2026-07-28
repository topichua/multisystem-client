import { Tree } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { Category } from "@/features/categories/model/category.types";

import { CategoryInlineFormRow } from "./category-inline-form-row";
import { CategoryTreeTitle } from "./category-tree-title";
import { DeleteCategoryWithProductsModal } from "./delete-category-with-products-modal";
import * as S from "./products-categories-tree.styled";
import { categoriesToTreeData } from "./products-categories-tree.utils";
import { useProductsCategoriesTree } from "./use-products-categories-tree";

type ProductsCategoriesTreeProps = {
  categories: Category[];
  expandAll?: boolean;
};

export const ProductsCategoriesTree = ({
  categories,
  expandAll = false,
}: ProductsCategoriesTreeProps) => {
  const { t } = useTranslation();
  const {
    addingParentId,
    cancelAddSubcategory,
    cancelRenameCategory,
    createLoading,
    deleteLoadingId,
    expandedKeys,
    handleCreateSubcategory,
    handleDeleteCategory,
    handleDeleteCategoryWithTransfer,
    handleRenameCategory,
    openAddSubcategory,
    openRenameCategory,
    pendingDeleteCategory,
    renameLoading,
    renamingCategoryId,
    renamingCategoryName,
    selectedCategoryId,
    setExpandedKeys,
    setPendingDeleteCategory,
    setRenamingCategoryName,
    setSubcategoryName,
    storeCategories,
    subcategoryName,
    toggleCategory,
  } = useProductsCategoriesTree({ categories, expandAll });

  const treeData = useMemo(
    () =>
      categoriesToTreeData({
        addingParentId,
        categories,
        selectedCategoryId,
        renderCreateRow: () => (
          <CategoryInlineFormRow
            value={subcategoryName}
            loading={createLoading}
            placeholder={t("categories.subcategoryNamePlaceholder")}
            submitLabel={t("categories.addSubcategorySubmit")}
            cancelLabel={t("categories.addSubcategoryCancel")}
            onChange={setSubcategoryName}
            onSubmit={handleCreateSubcategory}
            onCancel={cancelAddSubcategory}
          />
        ),
        renderTitle: (category) => {
          if (renamingCategoryId === category.id) {
            return (
              <CategoryInlineFormRow
                value={renamingCategoryName}
                loading={renameLoading}
                placeholder={t("categories.namePlaceholder")}
                submitLabel={t("categories.saveChanges")}
                cancelLabel={t("categories.cancel")}
                onChange={setRenamingCategoryName}
                onSubmit={() => handleRenameCategory(category)}
                onCancel={cancelRenameCategory}
              />
            );
          }

          return (
            <CategoryTreeTitle
              category={category}
              deleteLoading={deleteLoadingId === category.id}
              expandable={
                category.children.length > 0 || addingParentId === category.id
              }
              expanded={expandedKeys.includes(String(category.id))}
              selected={category.id === selectedCategoryId}
              onAddSubcategory={openAddSubcategory}
              onDeleteCategory={handleDeleteCategory}
              onEditCategory={openRenameCategory}
              onToggle={toggleCategory}
            />
          );
        },
      }),
    [
      addingParentId,
      cancelAddSubcategory,
      cancelRenameCategory,
      categories,
      createLoading,
      deleteLoadingId,
      expandedKeys,
      handleCreateSubcategory,
      handleDeleteCategory,
      handleRenameCategory,
      openAddSubcategory,
      openRenameCategory,
      renameLoading,
      renamingCategoryId,
      renamingCategoryName,
      selectedCategoryId,
      setRenamingCategoryName,
      setSubcategoryName,
      subcategoryName,
      t,
      toggleCategory,
    ],
  );

  return (
    <>
      <S.CategoriesTreeShell>
        <Tree
          blockNode
          expandedKeys={expandedKeys}
          switcherIcon={null}
          treeData={treeData}
          onExpand={setExpandedKeys}
        />
      </S.CategoriesTreeShell>

      <DeleteCategoryWithProductsModal
        categories={storeCategories}
        category={pendingDeleteCategory}
        loading={
          pendingDeleteCategory != null &&
          deleteLoadingId === pendingDeleteCategory.id
        }
        open={pendingDeleteCategory != null}
        onCancel={() => setPendingDeleteCategory(null)}
        onDelete={handleDeleteCategoryWithTransfer}
      />
    </>
  );
};
