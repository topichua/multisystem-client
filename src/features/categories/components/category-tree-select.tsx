import {
  CaretDownIcon,
  CaretRightIcon,
  FolderIcon,
  FolderOpenIcon,
  MagnifyingGlassIcon,
  XIcon,
} from "@phosphor-icons/react";
import { Dropdown, Form, Input } from "antd";
import type { TreeDataNode } from "antd";
import type { CSSProperties, Key, KeyboardEvent } from "react";
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { isUncategorizedCategory } from "@/features/categories/model/category.constants";
import type { Category } from "@/features/categories/model/category.types";

import * as S from "./category-tree-select.styled";

export type CategoryTreeSelectValue = number | null | undefined;

export type CategoryTreeSelectProps = {
  allowClear?: boolean;
  allowNoCategory?: boolean;
  categories: Category[];
  className?: string;
  disabled?: boolean;
  dropdownMaxHeight?: number;
  emptyText?: string;
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;
  includeUncategorized?: boolean;
  noCategoryLabel?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  style?: CSSProperties;
  value?: CategoryTreeSelectValue;
  onChange?: (value: CategoryTreeSelectValue) => void;
};

type CategoryPath = {
  id: number;
  names: string[];
};

type ExpansionState = {
  signature: string;
  expandedKeys: Key[];
};

const buildCategorySignature = (categories: Category[]): string =>
  categories
    .map(
      (category) =>
        `${category.id}:${category.children.length}:${buildCategorySignature(
          category.children,
        )}`,
    )
    .join("|");

const collectCategoryPaths = (
  categories: Category[],
  parents: string[] = [],
): CategoryPath[] =>
  categories.flatMap((category) => {
    const names = [...parents, category.name];

    return [
      { id: category.id, names },
      ...collectCategoryPaths(category.children, names),
    ];
  });

const filterCategories = (
  categories: Category[],
  searchValue: string,
): Category[] => {
  const normalizedSearch = searchValue.trim().toLowerCase();

  if (!normalizedSearch) {
    return categories;
  }

  return categories.flatMap((category) =>
    filterCategoryNode(category, normalizedSearch),
  );
};

const filterCategoryNode = (
  category: Category,
  normalizedSearch: string,
): Category[] => {
  if (category.name.toLowerCase().includes(normalizedSearch)) {
    return [category];
  }

  const children = category.children.flatMap((child) =>
    filterCategoryNode(child, normalizedSearch),
  );

  if (children.length === 0) {
    return [];
  }

  return [{ ...category, children }];
};

const filterSelectableCategories = (categories: Category[]): Category[] =>
  categories.flatMap((category) => {
    if (isUncategorizedCategory(category)) {
      return [];
    }

    return [
      {
        ...category,
        children: filterSelectableCategories(category.children),
      },
    ];
  });

const getTopExpandableKeys = (categories: Category[]): Key[] =>
  categories
    .filter((category) => category.children.length > 0)
    .map((category) => String(category.id));

const getExpandableKeys = (categories: Category[]): Key[] =>
  categories.flatMap((category) => {
    if (category.children.length === 0) {
      return [];
    }

    return [String(category.id), ...getExpandableKeys(category.children)];
  });

const categoriesToTreeData = (
  categories: Category[],
  expandedKeySet: Set<Key>,
): TreeDataNode[] =>
  categories.map((category) => {
    const key = String(category.id);
    const expanded = expandedKeySet.has(key);

    return {
      key,
      title: (
        <S.CategoryTitle title={category.name}>
          <S.CategoryIcon aria-hidden>
            {expanded ? <FolderOpenIcon size={16} /> : <FolderIcon size={16} />}
          </S.CategoryIcon>
          <S.CategoryName>{category.name}</S.CategoryName>
        </S.CategoryTitle>
      ),
      children:
        category.children.length > 0
          ? categoriesToTreeData(category.children, expandedKeySet)
          : undefined,
    };
  });

export const CategoryTreeSelect = ({
  allowClear = true,
  allowNoCategory = false,
  categories,
  className,
  disabled = false,
  dropdownMaxHeight,
  emptyText,
  getPopupContainer,
  includeUncategorized = false,
  noCategoryLabel,
  placeholder,
  searchPlaceholder,
  style,
  value,
  onChange,
}: CategoryTreeSelectProps) => {
  const { t } = useTranslation();
  const formStatus = Form.Item.useStatus();
  const controlStatus =
    formStatus.status === "error" || formStatus.status === "warning"
      ? formStatus.status
      : undefined;
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [popupWidth, setPopupWidth] = useState<number | undefined>();
  const [searchValue, setSearchValue] = useState("");

  const selectableCategories = useMemo(
    () =>
      includeUncategorized
        ? categories
        : filterSelectableCategories(categories),
    [categories, includeUncategorized],
  );
  const categorySignature = useMemo(
    () => buildCategorySignature(selectableCategories),
    [selectableCategories],
  );
  const [expansionState, setExpansionState] = useState<ExpansionState>({
    signature: categorySignature,
    expandedKeys: getTopExpandableKeys(selectableCategories),
  });

  let expandedKeys = expansionState.expandedKeys;

  if (expansionState.signature !== categorySignature) {
    const nextExpansionState = {
      signature: categorySignature,
      expandedKeys: getTopExpandableKeys(selectableCategories),
    };

    setExpansionState(nextExpansionState);
    expandedKeys = nextExpansionState.expandedKeys;
  }

  const categoryPathById = useMemo(
    () =>
      new Map(
        collectCategoryPaths(selectableCategories).map((categoryPath) => [
          categoryPath.id,
          categoryPath.names,
        ]),
      ),
    [selectableCategories],
  );

  const visibleCategories = useMemo(
    () => filterCategories(selectableCategories, searchValue),
    [searchValue, selectableCategories],
  );

  const activeExpandedKeys = searchValue.trim()
    ? getExpandableKeys(visibleCategories)
    : expandedKeys;
  const activeExpandedKeySet = useMemo(
    () => new Set(activeExpandedKeys),
    [activeExpandedKeys],
  );
  const treeData = useMemo(
    () => categoriesToTreeData(visibleCategories, activeExpandedKeySet),
    [activeExpandedKeySet, visibleCategories],
  );
  const selectedKeys = value == null ? [] : [String(value)];
  const selectedPath =
    typeof value === "number" ? categoryPathById.get(value) : undefined;
  const selectedLabel =
    value === null && allowNoCategory
      ? (noCategoryLabel ?? t("categories.noCategory"))
      : (selectedPath?.join(" / ") ??
        (typeof value === "number" ? `#${value}` : undefined));
  const displayLabel = selectedLabel ?? placeholder ?? "";
  const hasValue = value != null || (allowNoCategory && value === null);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (nextOpen) {
      setPopupWidth(rootRef.current?.offsetWidth);
      setSearchValue("");
    }
  };

  const handleControlKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(true);
    }

    if (event.key === "Escape") {
      setOpen(false);
    }
  };

  const selectValue = (nextValue: CategoryTreeSelectValue) => {
    onChange?.(nextValue);
    setOpen(false);
  };

  const handleTreeSelect = (selectedTreeKeys: Key[]) => {
    const [selectedKey] = selectedTreeKeys;

    if (selectedKey == null) {
      return;
    }

    selectValue(Number(selectedKey));
  };

  const handleClear = () => {
    onChange?.(undefined);
    setOpen(false);
  };

  const popupContent = (
    <S.DropdownPanel
      $width={popupWidth}
      onClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <S.DropdownSearch>
        <Input
          allowClear
          autoFocus
          prefix={<MagnifyingGlassIcon size={16} />}
          placeholder={searchPlaceholder ?? t("categories.searchPlaceholder")}
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
        />
      </S.DropdownSearch>

      <S.TreeShell style={{ maxHeight: dropdownMaxHeight }}>
        {allowNoCategory && (
          <S.NoCategoryOption
            type="button"
            $selected={value === null}
            onClick={() => selectValue(null)}
          >
            {noCategoryLabel ?? t("categories.noCategory")}
          </S.NoCategoryOption>
        )}

        {treeData.length > 0 ? (
          <S.CategoryTree
            blockNode
            expandedKeys={activeExpandedKeys}
            selectedKeys={selectedKeys}
            switcherIcon={({ expanded, isLeaf }) =>
              isLeaf ? null : expanded ? (
                <CaretDownIcon size={14} />
              ) : (
                <CaretRightIcon size={14} />
              )
            }
            treeData={treeData}
            onExpand={(keys) => {
              if (!searchValue.trim()) {
                setExpansionState((currentState) => ({
                  ...currentState,
                  expandedKeys: keys,
                }));
              }
            }}
            onSelect={handleTreeSelect}
          />
        ) : (
          <S.EmptyState>
            {emptyText ?? t("categories.emptySearch")}
          </S.EmptyState>
        )}
      </S.TreeShell>
    </S.DropdownPanel>
  );

  return (
    <S.SelectRoot ref={rootRef} className={className} style={style}>
      <Dropdown
        destroyOnHidden
        disabled={disabled}
        getPopupContainer={getPopupContainer}
        menu={{ items: [] }}
        open={open}
        placement="bottomLeft"
        trigger={["click"]}
        popupRender={() => popupContent}
        onOpenChange={handleOpenChange}
      >
        <S.SelectControl
          $disabled={disabled}
          $open={open}
          $status={controlStatus}
          aria-disabled={disabled}
          aria-expanded={open}
          aria-haspopup="tree"
          role="combobox"
          tabIndex={disabled ? -1 : 0}
          onKeyDown={handleControlKeyDown}
        >
          <S.SelectedValue $placeholder={!hasValue}>
            {displayLabel || placeholder}
          </S.SelectedValue>

          {allowClear && hasValue && !disabled && (
            <S.ControlIconButton
              type="button"
              aria-label={t("categories.clearCategorySelection")}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                handleClear();
              }}
            >
              <XIcon size={14} />
            </S.ControlIconButton>
          )}

          <S.ControlIconButton type="button" disabled={disabled} tabIndex={-1}>
            {open ? <CaretDownIcon size={14} /> : <CaretRightIcon size={14} />}
          </S.ControlIconButton>
        </S.SelectControl>
      </Dropdown>
    </S.SelectRoot>
  );
};
