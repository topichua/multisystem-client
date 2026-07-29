import { FolderOutlined } from "@ant-design/icons";
import { CheckIcon } from "@phosphor-icons/react";
import { Empty, Flex, Input } from "antd";
import type { TreeDataNode } from "antd";
import type { Key, ReactNode } from "react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import type { Category } from "@/features/categories/model/category.types";

import {
  filterCategoryTreeBySearch,
  getExpandableCategoryKeys,
} from "../products-categories.utils";
import * as S from "./category-target-picker.styled";

type CategoryTargetPickerProps = {
  categories: Category[];
  disabled?: boolean;
  emptyDescription: ReactNode;
  nullableOptionIcon: ReactNode;
  nullableOptionLabel: ReactNode;
  selectedCategoryId: number | null;
  onSelectCategory: (categoryId: number | null) => void;
};

const categoryTargetsToTreeData = (categories: Category[]): TreeDataNode[] =>
  categories.map((category) => ({
    key: String(category.id),
    title: category.name,
    icon: <FolderOutlined />,
    children:
      category.children.length > 0
        ? categoryTargetsToTreeData(category.children)
        : undefined,
  }));

export const CategoryTargetPicker = ({
  categories,
  disabled = false,
  emptyDescription,
  nullableOptionIcon,
  nullableOptionLabel,
  selectedCategoryId,
  onSelectCategory,
}: CategoryTargetPickerProps) => {
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState("");
  const isNullableOptionSelected = selectedCategoryId == null;

  const visibleCategories = useMemo(
    () => filterCategoryTreeBySearch(categories, searchValue),
    [categories, searchValue],
  );

  const expandedKeys = useMemo(
    () => getExpandableCategoryKeys(visibleCategories),
    [visibleCategories],
  );

  const treeData = useMemo(
    () => categoryTargetsToTreeData(visibleCategories),
    [visibleCategories],
  );

  const handleTreeSelect = (selectedKeys: Key[]) => {
    const [selectedKey] = selectedKeys;

    if (selectedKey == null || disabled) {
      return;
    }

    onSelectCategory(Number(selectedKey));
  };

  return (
    <Flex vertical gap={8}>
      <S.NullableOption
        type="button"
        $selected={isNullableOptionSelected}
        disabled={disabled}
        onClick={() => onSelectCategory(null)}
      >
        <S.NullableOptionContent>
          <S.NullableOptionIcon aria-hidden>
            {nullableOptionIcon}
          </S.NullableOptionIcon>
          <span>{nullableOptionLabel}</span>
        </S.NullableOptionContent>
        {isNullableOptionSelected && (
          <S.NullableOptionCheck aria-hidden>
            <CheckIcon size={16} weight="bold" />
          </S.NullableOptionCheck>
        )}
      </S.NullableOption>

      <Input.Search
        allowClear
        disabled={disabled}
        placeholder={t("categories.searchPlaceholder")}
        value={searchValue}
        onChange={(event) => setSearchValue(event.target.value)}
      />

      <S.TargetTreeShell>
        {treeData.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={emptyDescription}
          />
        ) : (
          <S.TargetTree
            blockNode
            showIcon
            expandedKeys={expandedKeys}
            selectable={!disabled}
            switcherIcon={null}
            selectedKeys={
              selectedCategoryId == null ? [] : [String(selectedCategoryId)]
            }
            treeData={treeData}
            onSelect={handleTreeSelect}
          />
        )}
      </S.TargetTreeShell>
    </Flex>
  );
};
