import { PencilSimpleIcon } from "@phosphor-icons/react";
import { Button, Flex, Input, Space, Typography } from "antd";
import { useTranslation } from "react-i18next";

import type { Category } from "@/features/categories/model/category.types";
import { formatDate } from "@/utils/date-time";

import { CATEGORY_NAME_MAX_LENGTH } from "../products-categories.constants";

const { Title, Text } = Typography;

type CategoryNameEditState = {
  isEditing: boolean;
  value: string;
  onChange: (value: string) => void;
  onOpen: () => void;
  onCancel: () => void;
  onSave: () => Promise<void>;
};

type CategoryDetailHeaderProps = {
  category: Category;
  subcategoriesCount: number;
  saveLoading: boolean;
  nameEdit: CategoryNameEditState;
};

export const CategoryDetailHeader = ({
  category,
  subcategoriesCount,
  saveLoading,
  nameEdit,
}: CategoryDetailHeaderProps) => {
  const { t } = useTranslation();

  return (
    <Flex vertical gap={12}>
      {nameEdit.isEditing ? (
        <Flex align="center" gap={8} wrap="wrap">
          <Input
            autoFocus
            value={nameEdit.value}
            maxLength={CATEGORY_NAME_MAX_LENGTH}
            onChange={(event) => nameEdit.onChange(event.target.value)}
            onPressEnter={() => void nameEdit.onSave()}
            style={{ flex: "1 1 240px", minWidth: 0, maxWidth: 420 }}
          />
          <Button
            type="primary"
            loading={saveLoading}
            onClick={() => void nameEdit.onSave()}
          >
            {t("categories.saveChanges")}
          </Button>
          <Button onClick={nameEdit.onCancel}>{t("categories.cancel")}</Button>
        </Flex>
      ) : (
        <Flex align="center" gap={8}>
          <Title level={2} style={{ margin: 0 }}>
            {category.name}
          </Title>
          <Button
            type="text"
            icon={<PencilSimpleIcon size={20} />}
            aria-label={t("categories.renameCategory")}
            onClick={nameEdit.onOpen}
          />
        </Flex>
      )}

      <Space size={8} separator={<Text type="secondary">·</Text>} wrap>
        <Text type="secondary">
          {t("categories.metaProductsCount", {
            count: category.productsCount,
          })}
        </Text>

        <Text type="secondary">
          {t("categories.metaSubcategories", {
            count: subcategoriesCount,
          })}
        </Text>

        <Text type="secondary">
          {t("categories.createdOn", { date: formatDate(category.createdAt) })}
        </Text>
      </Space>
    </Flex>
  );
};
