import { Form, Input, Modal, Select, Typography } from "antd";
import type { FormInstance } from "antd";
import { useTranslation } from "react-i18next";

import type { Category } from "@/features/categories/model/category.types";

import { CATEGORY_NAME_MAX_LENGTH } from "../products-categories.constants";
import type { CategoryCreateFormValues } from "../controllers/use-products-categories-layout-controller";

const { Text } = Typography;

type CategoryCreateModalProps = {
  form: FormInstance<CategoryCreateFormValues>;
  open: boolean;
  parentCategoryOptions: Category[];
  confirmLoading: boolean;
  onCancel: () => void;
  onCreate: () => Promise<void>;
};

export const CategoryCreateModal = ({
  form,
  open,
  parentCategoryOptions,
  confirmLoading,
  onCancel,
  onCreate,
}: CategoryCreateModalProps) => {
  const { t } = useTranslation();

  return (
    <Modal
      title={t("categories.modalCreateTitle")}
      open={open}
      onCancel={onCancel}
      onOk={onCreate}
      okText={t("categories.okCreate")}
      confirmLoading={confirmLoading}
      destroyOnHidden
      width={400}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label={t("categories.name")}
          rules={[
            { required: true, message: t("categories.nameRequired") },
            {
              max: CATEGORY_NAME_MAX_LENGTH,
              message: t("categories.nameTooLong"),
            },
          ]}
        >
          <Input placeholder={t("categories.namePlaceholder")} />
        </Form.Item>
        <Form.Item
          name="parentId"
          label={t("categories.parentCategory")}
          extra={
            <Text type="secondary">{t("categories.parentCategoryHint")}</Text>
          }
        >
          <Select
            allowClear
            placeholder={t("categories.noParent")}
            options={parentCategoryOptions.map((category) => ({
              value: category.id,
              label: category.name,
            }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
