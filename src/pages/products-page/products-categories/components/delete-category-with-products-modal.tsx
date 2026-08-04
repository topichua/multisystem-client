import { XIcon } from "@phosphor-icons/react";
import { Modal, Typography } from "antd";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { UNCATEGORIZED_CATEGORY_ID } from "@/features/categories/model/category.constants";
import type { Category } from "@/features/categories/model/category.types";
import { useIsMobileViewport } from "@/utils/use-media-query";

import { excludeCategoryBranchById } from "../products-categories.utils";
import { CategoryTargetPicker } from "./category-target-picker";

type DeleteCategoryWithProductsModalProps = {
  categories: Category[];
  category: Category | null;
  loading: boolean;
  open: boolean;
  onCancel: () => void;
  onDelete: (targetCategoryId: number | null) => Promise<void>;
};

type DeleteCategorySelectionState = {
  categoryId: number | null;
  selectedCategoryId: number | null;
};

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
  const currentCategoryId = open ? (category?.id ?? null) : null;
  const [selectionState, setSelectionState] =
    useState<DeleteCategorySelectionState>({
      categoryId: currentCategoryId,
      selectedCategoryId: null,
    });
  let selectedCategoryId = selectionState.selectedCategoryId;

  if (selectionState.categoryId !== currentCategoryId) {
    const nextSelectionState = {
      categoryId: currentCategoryId,
      selectedCategoryId: null,
    };

    setSelectionState(nextSelectionState);
    selectedCategoryId = nextSelectionState.selectedCategoryId;
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
      mask={{ closable: !loading }}
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

      <CategoryTargetPicker
        categories={availableCategories}
        disabled={loading}
        emptyDescription={t("categories.deleteTransferEmpty")}
        nullableOptionIcon={<XIcon size={16} />}
        nullableOptionLabel={t("categories.deleteTransferNoCategory")}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={(categoryId) =>
          setSelectionState((currentState) => ({
            ...currentState,
            selectedCategoryId: categoryId,
          }))
        }
      />
    </Modal>
  );
};
