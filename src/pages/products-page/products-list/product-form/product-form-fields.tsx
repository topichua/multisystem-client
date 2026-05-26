import { Flex, Form, Input, InputNumber, Select, Switch } from "antd";
import { useTranslation } from "react-i18next";

import type { ProductEditFormValues } from "../product-modal.types";

type CategoryOption = {
  value: number;
  label: string;
};

type ProductFormFieldsProps = {
  isEditMode: boolean;
  categoryOptions: CategoryOption[];
  onEditFieldBlur: (field: keyof ProductEditFormValues) => void;
};

export const ProductFormFields = ({
  isEditMode,
  categoryOptions,
  onEditFieldBlur,
}: ProductFormFieldsProps) => {
  const { t } = useTranslation();

  const blur = (field: keyof ProductEditFormValues) =>
    isEditMode ? () => void onEditFieldBlur(field) : undefined;

  const change = (field: keyof ProductEditFormValues) =>
    isEditMode ? () => void onEditFieldBlur(field) : undefined;

  return (
    <>
      <Flex gap={12} align="flex-start" wrap="wrap">
        <Form.Item
          name="name"
          label={t("products.form.name")}
          rules={[{ required: true, message: t("products.form.required") }]}
          style={{ flex: "1 1 240px", minWidth: 0 }}
        >
          <Input onBlur={blur("name")} />
        </Form.Item>
        <Form.Item
          name="status"
          label={t("products.form.status")}
          rules={[{ required: true, message: t("products.form.required") }]}
          style={{ flex: "0 1 200px", minWidth: 160 }}
        >
          <Select
            options={[
              { value: "draft", label: "Draft" },
              { value: "active", label: "Active" },
              { value: "archived", label: "Archived" },
            ]}
            onChange={change("status")}
          />
        </Form.Item>
      </Flex>
      <Form.Item name="description" label={t("products.form.description")}>
        <Input.TextArea rows={3} onBlur={blur("description")} />
      </Form.Item>
      <Form.Item
        name="categoryId"
        label={t("products.form.category")}
        rules={[{ required: true, message: t("products.form.required") }]}
      >
        <Select options={categoryOptions} onChange={change("categoryId")} />
      </Form.Item>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          columnGap: 12,
          rowGap: 12,
          alignItems: "start",
          marginBottom: 24,
        }}
      >
        <Form.Item
          name="price"
          label={t("products.form.price")}
          rules={[{ required: true, message: t("products.form.required") }]}
          style={{ marginBottom: 0 }}
        >
          <InputNumber
            min={0}
            style={{ width: "100%" }}
            onBlur={blur("price")}
          />
        </Form.Item>
        <Form.Item
          name="currency"
          label={t("products.form.currency")}
          rules={[{ required: true, message: t("products.form.required") }]}
          style={{ marginBottom: 0 }}
        >
          <Select
            options={[{ value: "UAH", label: "UAH" }]}
            onChange={change("currency")}
          />
        </Form.Item>
        <Form.Item
          name="inStock"
          label={t("products.form.inStock")}
          valuePropName="checked"
          style={{ marginBottom: 0 }}
        >
          <Switch onChange={change("inStock")} />
        </Form.Item>
        <Form.Item
          name="quantity"
          label={t("products.form.quantity")}
          rules={[{ required: true, message: t("products.form.required") }]}
          style={{ marginBottom: 0 }}
        >
          <InputNumber
            min={0}
            style={{ width: "100%" }}
            onBlur={blur("quantity")}
          />
        </Form.Item>
      </div>
    </>
  );
};
