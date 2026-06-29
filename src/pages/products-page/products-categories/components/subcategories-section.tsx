import { PencilSimpleIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import {
  Badge,
  Button,
  Card,
  Empty,
  Flex,
  Input,
  List,
  Popconfirm,
  Space,
  Typography,
} from "antd";
import { useTranslation } from "react-i18next";

import type { Category } from "@/features/categories/model/category.types";

import { CATEGORY_NAME_MAX_LENGTH } from "../products-categories.constants";

const { Text, Title } = Typography;

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

type SubcategoryListItemProps = {
  subcategory: Category;
  rename: SubcategoryRenameState;
  saveLoading: boolean;
  deleteLoading: boolean;
  onDelete: (subcategoryId: number) => Promise<void>;
};

type SubcategoriesSectionProps = {
  subcategories: Category[];
  create: SubcategoryCreateState;
  rename: SubcategoryRenameState;
  saveLoading: boolean;
  deleteLoadingId: number | null;
  onDeleteSubcategory: (subcategoryId: number) => Promise<void>;
  addSubcategoryDataQa?: string;
  getSubcategoryItemDataQa?: (subcategoryId: number) => string;
};

export const SubcategoriesSection = ({
  subcategories,
  create,
  rename,
  saveLoading,
  deleteLoadingId,
  onDeleteSubcategory,
  addSubcategoryDataQa,
  getSubcategoryItemDataQa,
}: SubcategoriesSectionProps) => {
  const { t } = useTranslation();

  const hasSubcategories = subcategories.length > 0;
  const showEmptyState = !hasSubcategories && !create.isAdding;

  return (
    <Card>
      <Flex vertical gap={16}>
        <Flex justify="space-between" align="center" gap={16} wrap="wrap">
          <Space size={8} align="center">
            <Title level={5} style={{ margin: 0 }}>
              {t("categories.subcategories")}
            </Title>

            <Badge
              count={subcategories.length}
              showZero
              color="rgba(0, 0, 0, 0.06)"
              style={{ color: "rgba(0, 0, 0, 0.65)" }}
            />
          </Space>

          {!create.isAdding && (
            <Button
              icon={<PlusIcon />}
              data-qa={addSubcategoryDataQa}
              aria-label={t("categories.mobile.addSubcategoryAria")}
              onClick={create.onOpen}
            >
              {t("categories.addSubcategory")}
            </Button>
          )}
        </Flex>

        {create.isAdding && (
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
        )}

        {hasSubcategories && (
          <List
            size="small"
            split
            dataSource={subcategories}
            renderItem={(subcategory) => (
              <List.Item
                key={subcategory.id}
                data-qa={getSubcategoryItemDataQa?.(subcategory.id)}
              >
                <SubcategoryListItem
                  subcategory={subcategory}
                  rename={rename}
                  saveLoading={saveLoading}
                  deleteLoading={deleteLoadingId === subcategory.id}
                  onDelete={onDeleteSubcategory}
                />
              </List.Item>
            )}
          />
        )}

        {showEmptyState && (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t("categories.noSubcategories")}
          />
        )}

        <Text type="secondary">{t("categories.deleteSubcategoryNote")}</Text>
      </Flex>
    </Card>
  );
};

const SubcategoryListItem = ({
  subcategory,
  rename,
  saveLoading,
  deleteLoading,
  onDelete,
}: SubcategoryListItemProps) => {
  const { t } = useTranslation();

  const isEditing = rename.id === subcategory.id;

  if (isEditing) {
    return (
      <CategoryNameFormRow
        value={rename.value}
        submitLabel={t("categories.saveChanges")}
        cancelLabel={t("categories.cancel")}
        loading={saveLoading}
        onChange={rename.onChange}
        onSubmit={() => rename.onSave(subcategory.id, subcategory.parentId)}
        onCancel={rename.onCancel}
      />
    );
  }

  return (
    <Flex
      align="center"
      justify="space-between"
      gap={16}
      style={{ width: "100%" }}
    >
      <Flex vertical gap={2} style={{ minWidth: 0 }}>
        <Text strong ellipsis={{ tooltip: subcategory.name }}>
          {subcategory.name}
        </Text>

        <Text italic type="secondary" style={{ fontSize: 11 }}>
          {t("categories.metaProductsCount", {
            count: subcategory.productsCount,
          })}
        </Text>
      </Flex>

      <Space size={4}>
        <Button
          type="text"
          icon={<PencilSimpleIcon size={18} />}
          aria-label={t("categories.renameSubcategory")}
          onClick={() => rename.onOpen(subcategory.id, subcategory.name)}
        />

        <Popconfirm
          title={t("categories.deleteConfirm")}
          description={t("categories.deleteWarning")}
          okText={t("categories.delete")}
          okButtonProps={{ danger: true }}
          onConfirm={() => onDelete(subcategory.id)}
        >
          <Button
            type="text"
            danger
            icon={<TrashIcon size={18} />}
            loading={deleteLoading}
            aria-label={t("categories.delete")}
          />
        </Popconfirm>
      </Space>
    </Flex>
  );
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
  <Flex align="center" gap={8} wrap="wrap">
    <Input
      autoFocus
      value={value}
      placeholder={placeholder}
      maxLength={CATEGORY_NAME_MAX_LENGTH}
      style={{ flex: "1 1 240px" }}
      onChange={(event) => onChange(event.target.value)}
      onPressEnter={() => void onSubmit()}
    />

    <Button type="primary" loading={loading} onClick={() => void onSubmit()}>
      {submitLabel}
    </Button>

    <Button onClick={onCancel}>{cancelLabel}</Button>
  </Flex>
);
