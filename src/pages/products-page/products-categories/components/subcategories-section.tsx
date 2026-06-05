import { PencilSimpleIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import {
  Badge,
  Button,
  Divider,
  Empty,
  Flex,
  Input,
  Popconfirm,
  Space,
  Typography,
} from "antd";
import { useTranslation } from "react-i18next";
import type { Category } from "@/features/categories/model/category.types";
import * as S from "../product-category-detail-view.styled";
import { CATEGORY_NAME_MAX_LENGTH } from "../products-categories.constants";

const { Title, Text } = Typography;

type CategoryNameFormRowProps = {
  value: string;
  placeholder?: string;
  submitLabel: string;
  cancelLabel: string;
  loading: boolean;
  onChange: (value: string) => void;
  onSubmit: () => Promise<void>;
  onCancel: () => void;
};

const CategoryNameFormRow = ({
  value,
  placeholder,
  submitLabel,
  cancelLabel,
  loading,
  onChange,
  onSubmit,
  onCancel,
}: CategoryNameFormRowProps) => (
  <S.CategoryNameFormRow>
    <Input
      autoFocus
      value={value}
      placeholder={placeholder}
      maxLength={CATEGORY_NAME_MAX_LENGTH}
      onChange={(event) => onChange(event.target.value)}
      onPressEnter={() => void onSubmit()}
    />
    <Button type="primary" loading={loading} onClick={() => void onSubmit()}>
      {submitLabel}
    </Button>
    <Button onClick={onCancel}>{cancelLabel}</Button>
  </S.CategoryNameFormRow>
);

type SubcategoryCreateState = {
  isAdding: boolean;
  value: string;
  onChange: (value: string) => void;
  onOpen: () => void;
  onCancel: () => void;
  onCreate: () => Promise<void>;
};

type SubcategoryRenameState = {
  id: number | null;
  value: string;
  onChange: (value: string) => void;
  onOpen: (subcategoryId: number, subcategoryName: string) => void;
  onCancel: () => void;
  onSave: (subcategoryId: number, parentId: number | null) => Promise<void>;
};

type SubcategoriesSectionProps = {
  subcategories: Category[];
  create: SubcategoryCreateState;
  rename: SubcategoryRenameState;
  saveLoading: boolean;
  deleteLoadingId: number | null;
  onDeleteSubcategory: (subcategoryId: number) => Promise<void>;
};

export const SubcategoriesSection = ({
  subcategories,
  create,
  rename,
  saveLoading,
  deleteLoadingId,
  onDeleteSubcategory,
}: SubcategoriesSectionProps) => {
  const { t } = useTranslation();
  const subcategoriesCount = subcategories.length;

  return (
    <>
      <Flex justify="space-between" align="center" gap={16} wrap="wrap">
        <Space size={8} align="center">
          <Title level={5} style={{ margin: 0 }}>
            {t("categories.subcategories")}
          </Title>
          <Badge
            count={subcategoriesCount}
            color="rgba(0, 0, 0, 0.06)"
            style={{ color: "rgba(0, 0, 0, 0.65)" }}
            showZero
          />
        </Space>

        {!create.isAdding ? (
          <Button icon={<PlusIcon />} onClick={create.onOpen}>
            {t("categories.addSubcategory")}
          </Button>
        ) : null}
      </Flex>

      {create.isAdding ? (
        <CategoryNameFormRow
          value={create.value}
          placeholder={t("categories.subcategoryNamePlaceholder")}
          submitLabel={t("categories.addSubcategorySubmit")}
          cancelLabel={t("categories.addSubcategoryCancel")}
          loading={saveLoading}
          onChange={create.onChange}
          onSubmit={create.onCreate}
          onCancel={create.onCancel}
        />
      ) : null}

      {subcategories.length > 0 ? (
        <Flex vertical>
          {subcategories.map((child, index) => (
            <div key={child.id}>
              {index > 0 ? <Divider style={{ margin: 0 }} /> : null}
              <S.SubcategoryRow>
                {rename.id === child.id ? (
                  <CategoryNameFormRow
                    value={rename.value}
                    submitLabel={t("categories.saveChanges")}
                    cancelLabel={t("categories.cancel")}
                    loading={saveLoading}
                    onChange={rename.onChange}
                    onSubmit={() => rename.onSave(child.id, child.parentId)}
                    onCancel={rename.onCancel}
                  />
                ) : (
                  <Flex
                    align="center"
                    justify="space-between"
                    gap={16}
                    style={{ width: "100%" }}
                  >
                    <Flex gap={2} vertical style={{ minWidth: 0 }}>
                      <Text strong ellipsis={{ tooltip: child.name }}>
                        {child.name}
                      </Text>
                      <Text italic type="secondary" style={{ fontSize: 11 }}>
                        {t("categories.metaProductsCount", {
                          count: child.productsCount,
                        })}
                      </Text>
                    </Flex>

                    <Space size={4}>
                      <Button
                        type="text"
                        icon={<PencilSimpleIcon size={18} />}
                        aria-label={t("categories.renameSubcategory")}
                        onClick={() => rename.onOpen(child.id, child.name)}
                      />
                      <Popconfirm
                        title={t("categories.deleteConfirm")}
                        description={t("categories.deleteWarning")}
                        okText={t("categories.delete")}
                        okButtonProps={{ danger: true }}
                        onConfirm={() => void onDeleteSubcategory(child.id)}
                      >
                        <Button
                          type="text"
                          danger
                          icon={<TrashIcon size={18} />}
                          loading={deleteLoadingId === child.id}
                          aria-label={t("categories.delete")}
                        />
                      </Popconfirm>
                    </Space>
                  </Flex>
                )}
              </S.SubcategoryRow>
            </div>
          ))}
        </Flex>
      ) : !create.isAdding ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t("categories.noSubcategories")}
        />
      ) : null}

      <Text type="secondary">{t("categories.deleteSubcategoryNote")}</Text>
    </>
  );
};
