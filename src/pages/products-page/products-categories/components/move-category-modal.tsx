import { FolderOutlined } from "@ant-design/icons";
import { ArrowUpRightIcon } from "@phosphor-icons/react";
import { Modal, Typography } from "antd";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { UNCATEGORIZED_CATEGORY_ID } from "@/features/categories/model/category.constants";
import type { Category } from "@/features/categories/model/category.types";
import { useIsMobileViewport } from "@/utils/use-media-query";

import { excludeCategoryBranchById } from "../products-categories.utils";
import { CategoryTargetPicker } from "./category-target-picker";

type MoveCategoryModalProps = {
  categories: Category[];
  category: Category | null;
  loading: boolean;
  open: boolean;
  onCancel: () => void;
  onMove: (parentCategoryId: number | null) => Promise<void>;
};

type MoveCategorySelectionState = {
  categoryId: number | null;
  parentId: number | null;
  selectedParentId: number | null;
};

export const MoveCategoryModal = ({
  categories,
  category,
  loading,
  open,
  onCancel,
  onMove,
}: MoveCategoryModalProps) => {
  const { t } = useTranslation();
  const isMobileViewport = useIsMobileViewport();
  const currentCategoryId = open ? (category?.id ?? null) : null;
  const currentParentId = open ? (category?.parentId ?? null) : null;
  const [selectionState, setSelectionState] =
    useState<MoveCategorySelectionState>({
      categoryId: currentCategoryId,
      parentId: currentParentId,
      selectedParentId: currentParentId,
    });
  let selectedParentId = selectionState.selectedParentId;

  if (
    selectionState.categoryId !== currentCategoryId ||
    selectionState.parentId !== currentParentId
  ) {
    const nextSelectionState = {
      categoryId: currentCategoryId,
      parentId: currentParentId,
      selectedParentId: currentParentId,
    };

    setSelectionState(nextSelectionState);
    selectedParentId = nextSelectionState.selectedParentId;
  }

  const availableCategories = useMemo(() => {
    const categoriesWithoutMovedBranch = category
      ? excludeCategoryBranchById(categories, category.id)
      : categories;

    return excludeCategoryBranchById(
      categoriesWithoutMovedBranch,
      UNCATEGORIZED_CATEGORY_ID,
    );
  }, [categories, category]);

  const parentUnchanged =
    category == null || selectedParentId === currentParentId;

  return (
    <Modal
      destroyOnHidden
      centered
      title={
        category
          ? t("categories.moveCategoryTitle", { name: category.name })
          : t("categories.moveCategory")
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
      okText={t("categories.moveCategorySubmit")}
      cancelText={t("categories.cancel")}
      confirmLoading={loading}
      okButtonProps={{
        disabled: loading || parentUnchanged,
        icon: <ArrowUpRightIcon size={16} />,
      }}
      cancelButtonProps={{ disabled: loading }}
      onOk={() => {
        if (!parentUnchanged) {
          void onMove(selectedParentId);
        }
      }}
    >
      <Typography.Paragraph>
        {t("categories.moveCategoryDescription")}
      </Typography.Paragraph>

      <CategoryTargetPicker
        categories={availableCategories}
        disabled={loading}
        emptyDescription={t("categories.moveCategoryEmpty")}
        nullableOptionIcon={<FolderOutlined />}
        nullableOptionLabel={t("categories.moveCategoryRootOption")}
        selectedCategoryId={selectedParentId}
        onSelectCategory={(parentCategoryId) =>
          setSelectionState((currentState) => ({
            ...currentState,
            selectedParentId: parentCategoryId,
          }))
        }
      />
    </Modal>
  );
};
