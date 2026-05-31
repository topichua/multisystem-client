import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { Button, Card, Flex, Form, Select, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useTranslation } from "react-i18next";
import type { VariantCustomField } from "@/features/products/model/product-create-api.types";
import type { ProductVariantUi } from "../variants/product-add-variant.types";

const { Title, Text } = Typography;

type CharacteristicRow = {
  attributeId?: number;
  values?: string[];
};

export type ProductVariantsSectionProps = {
  productVariants: ProductVariantUi[];
  variantTableColumns: ColumnsType<ProductVariantUi>;
  watchedCharacteristics: CharacteristicRow[] | undefined;
  variantCustomFields: VariantCustomField[];
  isVariantCustomFieldsLoading: boolean;
  getCharacteristicFieldOptionsForRow: (
    currentAttributeId?: number,
  ) => Array<{ value: number; label: string; disabled?: boolean }>;
  getCharacteristicValueOptions: (
    attributeId?: number,
  ) => Array<{ value: string; label: string }>;
  onAddManualVariant: () => void;
};

export const ProductVariantsSection = ({
  productVariants,
  variantTableColumns,
  watchedCharacteristics,
  variantCustomFields,
  isVariantCustomFieldsLoading,
  getCharacteristicFieldOptionsForRow,
  getCharacteristicValueOptions,
  onAddManualVariant,
}: ProductVariantsSectionProps) => {
  const { t } = useTranslation();

  return (
    <Card>
      <Flex vertical gap={24}>
        <Flex vertical gap={4}>
          <Title level={4} style={{ margin: 0 }}>
            {t("products.variantsForm.title")}
          </Title>

          <Text type="secondary">{t("products.variantsForm.description")}</Text>
        </Flex>

        <Card size="small" title={t("products.characteristics.title")}>
          <Form.List name="characteristics">
            {(fields, { add, remove }) => (
              <Flex vertical gap={12}>
                {fields.map((field) => {
                  const row = Array.isArray(watchedCharacteristics)
                    ? watchedCharacteristics[field.name]
                    : undefined;
                  const rowAttributeId =
                    typeof row?.attributeId === "number" &&
                    Number.isFinite(row.attributeId)
                      ? row.attributeId
                      : undefined;
                  const hasSelectedCharacteristic = rowAttributeId != null;
                  const selectedField =
                    rowAttributeId != null
                      ? variantCustomFields.find(
                          (item) => item.id === rowAttributeId,
                        )
                      : undefined;
                  const valuesPlaceholder = !hasSelectedCharacteristic
                    ? t("products.characteristics.chooseFirst")
                    : selectedField?.type === "options"
                      ? t("products.characteristics.addValues")
                      : t("products.characteristics.addCustomValues");

                  return (
                    <Flex key={field.key} gap={12} align="flex-start">
                      <Form.Item
                        name={[field.name, "attributeId"]}
                        rules={[
                          {
                            required: true,
                            message: t("products.characteristics.choose"),
                          },
                        ]}
                        style={{ width: 280, marginBottom: 0 }}
                      >
                        <Select
                          placeholder={t("products.characteristics.choose")}
                          options={getCharacteristicFieldOptionsForRow(
                            rowAttributeId,
                          )}
                          loading={isVariantCustomFieldsLoading}
                          disabled={isVariantCustomFieldsLoading}
                        />
                      </Form.Item>

                      <Form.Item
                        name={[field.name, "values"]}
                        rules={[
                          {
                            required: true,
                            message: t("products.characteristics.addValues"),
                          },
                        ]}
                        style={{ flex: 1, marginBottom: 0 }}
                      >
                        <Select
                          mode="tags"
                          options={getCharacteristicValueOptions(
                            rowAttributeId,
                          )}
                          disabled={!hasSelectedCharacteristic}
                          placeholder={valuesPlaceholder}
                          tokenSeparators={[","]}
                        />
                      </Form.Item>

                      <Button
                        danger
                        icon={<TrashIcon />}
                        onClick={() => remove(field.name)}
                      />
                    </Flex>
                  );
                })}

                <Button
                  icon={<PlusIcon />}
                  onClick={() => add()}
                  style={{ alignSelf: "flex-start" }}
                >
                  {t("products.characteristics.add")}
                </Button>
              </Flex>
            )}
          </Form.List>
        </Card>

        <Flex vertical gap={12}>
          <Title level={5} style={{ margin: 0 }}>
            {t("products.variantsForm.variants")}{" "}
            <Text type="secondary" style={{ fontSize: 14 }}>
              {productVariants.length}
            </Text>
          </Title>

          {productVariants.length === 0 ? (
            <Flex
              vertical
              align="center"
              justify="center"
              gap={16}
              style={{
                padding: 32,
                border: "1px dashed #d9d9d9",
                borderRadius: 8,
                background: "#fafafa",
              }}
            >
              <Text type="secondary" style={{ textAlign: "center" }}>
                {t("products.variantsForm.empty")}
              </Text>

              <Button icon={<PlusIcon />} onClick={onAddManualVariant}>
                {t("products.variantAddCta")}
              </Button>
            </Flex>
          ) : (
            <>
              <Table<ProductVariantUi>
                rowKey="key"
                dataSource={productVariants}
                pagination={false}
                scroll={{ x: 1000 }}
                columns={variantTableColumns}
              />

              <Button
                icon={<PlusIcon />}
                onClick={onAddManualVariant}
                style={{ alignSelf: "flex-start" }}
              >
                {t("products.variantAddCta")}
              </Button>
            </>
          )}
        </Flex>
      </Flex>
    </Card>
  );
};
