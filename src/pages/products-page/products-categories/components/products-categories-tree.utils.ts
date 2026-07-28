import type { Key, ReactNode } from "react";
import type { TreeDataNode } from "antd";

import type { Category } from "@/features/categories/model/category.types";

type CategoriesToTreeDataParams = {
  addingParentId?: number | null;
  categories: Category[];
  selectedCategoryId: number | null;
  renderCreateRow?: (parentCategory: Category) => ReactNode;
  renderTitle: (category: Category) => ReactNode;
};

export const categoriesToTreeData = ({
  addingParentId,
  categories,
  selectedCategoryId,
  renderCreateRow,
  renderTitle,
}: CategoriesToTreeDataParams): TreeDataNode[] =>
  categories.map((category) => {
    const children = categoriesToTreeData({
      addingParentId,
      categories: category.children,
      selectedCategoryId,
      renderCreateRow,
      renderTitle,
    });

    if (addingParentId === category.id && renderCreateRow) {
      children.unshift({
        key: `create-subcategory-${category.id}`,
        title: renderCreateRow(category),
        selectable: false,
      });
    }

    return {
      key: String(category.id),
      title: renderTitle(category),
      selectable: category.id !== selectedCategoryId,
      children: children.length > 0 ? children : undefined,
    };
  });

export const resolveExpandedKeys = ({
  addingParentId,
  currentKeys,
  expandAll,
  expandableKeySet,
  expandableKeys,
}: {
  addingParentId: number | null;
  currentKeys: Key[];
  expandAll: boolean;
  expandableKeySet: Set<string>;
  expandableKeys: string[];
}): Key[] => {
  const addingParentKey =
    addingParentId == null ? null : String(addingParentId);

  if (expandAll) {
    return addingParentKey == null || expandableKeySet.has(addingParentKey)
      ? expandableKeys
      : [...expandableKeys, addingParentKey];
  }

  return currentKeys.filter((currentKey) => {
    const key = String(currentKey);

    return expandableKeySet.has(key) || key === addingParentKey;
  });
};
