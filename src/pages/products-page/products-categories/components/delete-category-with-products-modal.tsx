import { FolderOutlined } from "@ant-design/icons";
import { CheckIcon, XIcon } from "@phosphor-icons/react";
import { Empty, Flex, Input, Modal, Typography } from "antd";
import type { TreeDataNode } from "antd";
import type { Key } from "react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { UNCATEGORIZED_CATEGORY_ID } from "@/features/categories/model/category.constants";
import type { Category } from "@/features/categories/model/category.types";
import { useIsMobileViewport } from "@/utils/use-media-query";

import {
  excludeCategoryBranchById,
  filterCategoryTreeBySearch,
  getExpandableCategoryKeys,
} from "../products-categories.utils";
import * as S from "./delete-category-with-products-modal.styled";

type DeleteCategoryWithProductsModalProps = {
  categories: Category[];
  category: Category | null;
  loading: boolean;
  open: boolean;
  onCancel: () => void;
  onDelete: (targetCategoryId: number | null) => Promise<void>;
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

export const DeleteCategoryWithProductsModal = ({
  categories,
  category,
  loading,
  open,
  onCancel,
  onDelete,
}: DeleteCategoryWithProductsModalProps) => {
  const { t } = useTranslation();
  const isMobileViewport = useIsMobileViewport();
  const [searchValue, setSearchValue] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [prevOpen, setPrevOpen] = useState(open);
  const isNoCategorySelected = selectedCategoryId == null;

  if (open !== prevOpen) {
    setPrevOpen(open);

    if (open) {
      setSearchValue("");
      setSelectedCategoryId(null);
    }
  }

  const availableCategories = useMemo(() => {
    const categoriesWithoutDeletedBranch = category
      ? excludeCategoryBranchById(categories, category.id)
      : categories;

    return excludeCategoryBranchById(
      categoriesWithoutDeletedBranch,
      UNCATEGORIZED_CATEGORY_ID,
    );
  }, [categories, category]);

  const visibleCategories = useMemo(
    () => filterCategoryTreeBySearch(availableCategories, searchValue),
    [availableCategories, searchValue],
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

    if (selectedKey == null) {
      return;
    }

    setSelectedCategoryId(Number(selectedKey));
  };

  return (
    <Modal
      destroyOnHidden
      centered
      title={
        category
          ? t("categories.deleteTransferTitle", { name: category.name })
          : t("categories.deleteCategory")
      }
      width={isMobileViewport ? "calc(100vw - 32px)" : 440}
      open={open}
      closable={!loading}
      keyboard={!loading}
      maskClosable={!loading}
      styles={
        isMobileViewport
          ? {
              body: {
                maxHeight: "calc(100dvh - 12rem)",
                overflowY: "auto",
              },
            }
          : undefined
      }
      onCancel={onCancel}
      okText={t("categories.deleteCategory")}
      cancelText={t("categories.cancel")}
      confirmLoading={loading}
      okButtonProps={{ danger: true }}
      cancelButtonProps={{ disabled: loading }}
      onOk={() => void onDelete(selectedCategoryId)}
    >
      <Typography.Paragraph>
        {t("categories.deleteTransferDescription", {
          productCount: category?.productCount ?? 0,
          productVariantCount: category?.productVariantCount ?? 0,
        })}
      </Typography.Paragraph>

      <Flex vertical gap={8}>
        <S.NoCategoryOption
          type="button"
          $selected={isNoCategorySelected}
          disabled={loading}
          onClick={() => setSelectedCategoryId(null)}
        >
          <S.NoCategoryOptionContent>
            <S.NoCategoryOptionIcon aria-hidden>
              <XIcon size={16} />
            </S.NoCategoryOptionIcon>
            <span>{t("categories.deleteTransferNoCategory")}</span>
          </S.NoCategoryOptionContent>
          {isNoCategorySelected ? (
            <S.NoCategoryOptionCheck aria-hidden>
              <CheckIcon size={16} weight="bold" />
            </S.NoCategoryOptionCheck>
          ) : null}
        </S.NoCategoryOption>

        <Input.Search
          allowClear
          disabled={loading}
          placeholder={t("categories.searchPlaceholder")}
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
        />

        <S.TargetTreeShell>
          {treeData.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={t("categories.deleteTransferEmpty")}
            />
          ) : (
            <S.TargetTree
              blockNode
              showIcon
              expandedKeys={expandedKeys}
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
    </Modal>
  );
};
