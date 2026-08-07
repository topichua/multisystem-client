import { CubeIcon } from "@phosphor-icons/react";
import { Button, Card, Col, Flex, Form, Input, InputNumber, Row } from "antd";
import { Typography } from "antd";
// import { Select } from "antd";
// import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CategoryTreeSelect } from "@/features/categories/components/category-tree-select";
import type { Category } from "@/features/categories/model/category.types";
import { ProductDeliverySection } from "./product-delivery-section";

const { Title, Text } = Typography;

// type StatusOption = {
//   value: string;
//   label: string;
// };

export type ProductMainInfoSectionProps = {
  categories: Category[];
  requiredMessage: string;
  labels: {
    name: string;
    category: string;
    price: string;
    quantity: string;
    // Publication parameters are temporarily hidden on product edit.
    // status: string;
    sku: string;
  };
  showQuantityField: boolean;
  isQuantityReadOnly?: boolean;
  onManageInventory?: () => void;
  showPriceField?: boolean;
  showSkuField?: boolean;
  // Publication parameters are temporarily hidden on product edit.
  // showStatusField?: boolean;
  isMobile?: boolean;
};

export const ProductMainInfoSection = ({
  categories,
  requiredMessage,
  labels,
  showQuantityField,
  isQuantityReadOnly = false,
  onManageInventory,
  showPriceField = true,
  showSkuField = false,
  // Publication parameters are temporarily hidden on product edit.
  // showStatusField = true,
  isMobile = false,
}: ProductMainInfoSectionProps) => {
  const { t } = useTranslation();
  const mainFieldSpan =
    !isMobile &&
    [showPriceField, showSkuField, showQuantityField].filter(Boolean).length >=
      3
      ? 8
      : isMobile
        ? 24
        : 12;

  // const statusOptions: StatusOption[] = useMemo(
  //   () => [
  //     { value: "draft", label: t("products.status.draft") },
  //     { value: "active", label: t("products.status.active") },
  //     { value: "archived", label: t("products.status.archived") },
  //   ],
  //   [t],
  // );

  return (
    <Card>
      <Flex vertical gap={12}>
        <Title level={5} style={{ margin: 0 }}>
          {t("products.form.mainInfoTitle")}
        </Title>

        <Row gutter={isMobile ? [0, 0] : [24, 0]}>
          <Col span={isMobile ? 24 : 12}>
            <Form.Item
              name="name"
              label={labels.name}
              rules={[
                {
                  required: true,
                  message: requiredMessage,
                },
              ]}
            >
              <Input placeholder={t("products.form.namePlaceholder")} />
            </Form.Item>
          </Col>

          <Col span={isMobile ? 24 : 12}>
            <Form.Item name="categoryId" label={labels.category}>
              <CategoryTreeSelect
                categories={categories}
                allowClear
                includeUncategorized
                placeholder={t("products.form.categoryPlaceholder")}
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label={t("products.form.description")}
              name="description"
            >
              <Input.TextArea
                placeholder={t("products.form.descriptionPlaceholder")}
                maxLength={1000}
                showCount
                autoSize={{ minRows: 2, maxRows: 10 }}
              />
            </Form.Item>
          </Col>

          {showPriceField ? (
            <Col span={mainFieldSpan}>
              <Form.Item
                name="price"
                label={labels.price}
                rules={[
                  {
                    required: true,
                    message: requiredMessage,
                  },
                  {
                    type: "number",
                    min: 0,
                    message: requiredMessage,
                  },
                ]}
              >
                <InputNumber
                  min={0}
                  placeholder="0.00"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          ) : (
            <Form.Item name="price" hidden>
              <Input />
            </Form.Item>
          )}

          {showSkuField ? (
            <Col span={mainFieldSpan}>
              <Form.Item name="sku" label={labels.sku}>
                <Input placeholder={t("products.form.skuPlaceholder")} />
              </Form.Item>
            </Col>
          ) : (
            <Form.Item name="sku" hidden>
              <Input />
            </Form.Item>
          )}

          {showQuantityField && (
            <Col span={mainFieldSpan}>
              <Flex align="flex-start" gap={8}>
                <Form.Item
                  name="quantity"
                  label={labels.quantity}
                  rules={[
                    {
                      required: true,
                      message: requiredMessage,
                    },
                    {
                      type: "number",
                      min: 0,
                      message: requiredMessage,
                    },
                  ]}
                  style={{
                    flex: "1 1 160px",
                    minWidth: 0,
                    marginBottom: isQuantityReadOnly ? 4 : undefined,
                  }}
                >
                  <InputNumber
                    min={0}
                    precision={0}
                    placeholder="0"
                    // In advanced inventory edit mode, stock changes must go through
                    // the inventory drawer so movement history and purchase cost stay consistent.
                    disabled={isQuantityReadOnly}
                    style={{ width: "100%" }}
                  />
                </Form.Item>

                {onManageInventory != null && (
                  <Button
                    htmlType="button"
                    icon={<CubeIcon size={16} />}
                    onClick={onManageInventory}
                    style={{ flexShrink: 0, marginTop: 30 }}
                  >
                    {t("products.variantsForm.manageInventory")}
                  </Button>
                )}
              </Flex>

              {isQuantityReadOnly && (
                <Text type="secondary" style={{ display: "block" }}>
                  {t("products.form.quantityAdvancedInventoryHint")}
                </Text>
              )}
            </Col>
          )}
        </Row>

        <ProductDeliverySection isMobile={isMobile} />

        {/*
        {showStatusField ? (
          <Flex vertical gap={16}>
            <Title level={5} style={{ margin: 0 }}>
              {t("products.publication.title")}
            </Title>

            <Form.Item
              name="status"
              label={labels.status}
              rules={[
                {
                  required: true,
                  message: requiredMessage,
                },
              ]}
              style={{ marginBottom: 0 }}
            >
              <Select options={statusOptions} />
            </Form.Item>

            <Text type="secondary">{t("products.publication.draftHint")}</Text>
          </Flex>
        ) : (
          <Form.Item name="status" hidden>
            <Input />
          </Form.Item>
        )}
        */}
        <Form.Item name="status" hidden>
          <Input />
        </Form.Item>
      </Flex>
    </Card>
  );
};
