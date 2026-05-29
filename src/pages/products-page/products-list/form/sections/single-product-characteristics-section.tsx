import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { Button, Card, Flex, Form, Input, Select, Typography } from "antd";
import type { FormInstance } from "antd";
import type { VariantCustomField } from "@/features/products/model/product-create-api.types";

const { Title, Text } = Typography;

type SingleCharacteristicRow = {
  attributeId?: number;
  value?: string;
};

export type SingleProductCharacteristicsSectionProps = {
  form: FormInstance;
  watchedSingleCharacteristics: SingleCharacteristicRow[] | undefined;
  variantCustomFields: VariantCustomField[];
  isVariantCustomFieldsLoading: boolean;
  getSingleCharacteristicFieldOptionsForRow: (
    currentAttributeId?: number,
  ) => Array<{ value: number; label: string; disabled?: boolean }>;
  getCharacteristicValueOptions: (
    attributeId?: number,
  ) => Array<{ value: string; label: string }>;
};

export const SingleProductCharacteristicsSection = ({
  form,
  watchedSingleCharacteristics,
  variantCustomFields,
  isVariantCustomFieldsLoading,
  getSingleCharacteristicFieldOptionsForRow,
  getCharacteristicValueOptions,
}: SingleProductCharacteristicsSectionProps) => (
  <Card>
    <Flex vertical gap={24}>
      <Flex vertical gap={4}>
        <Title level={4} style={{ margin: 0 }}>
          Characteristics
        </Title>

        <Text type="secondary">
          Add optional characteristics like color or size. Each value is
          selected once for the product.
        </Text>
      </Flex>

      <Form.List name="singleCharacteristics">
        {(fields, { add, remove }) => (
          <Flex vertical gap={12}>
            {fields.map((field) => {
              const row = Array.isArray(watchedSingleCharacteristics)
                ? watchedSingleCharacteristics[field.name]
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
              const isOptionsField = selectedField?.type === "options";
              const valuePlaceholder = !hasSelectedCharacteristic
                ? "Choose characteristic first"
                : isOptionsField
                  ? "Choose value"
                  : "Enter custom value";

              return (
                <Flex key={field.key} gap={12} align="flex-start">
                  <Form.Item
                    name={[field.name, "attributeId"]}
                    rules={[
                      {
                        required: true,
                        message: "Choose characteristic",
                      },
                    ]}
                    style={{ width: 280, marginBottom: 0 }}
                  >
                    <Select
                      placeholder="Choose characteristic"
                      options={getSingleCharacteristicFieldOptionsForRow(
                        rowAttributeId,
                      )}
                      loading={isVariantCustomFieldsLoading}
                      disabled={isVariantCustomFieldsLoading}
                      onChange={() => {
                        form.setFieldValue(
                          ["singleCharacteristics", field.name, "value"],
                          undefined,
                        );
                      }}
                    />
                  </Form.Item>

                  <Form.Item
                    name={[field.name, "value"]}
                    rules={[
                      {
                        required: true,
                        message: "Enter value",
                      },
                      {
                        validator: async (_, value) => {
                          if (typeof value !== "string" || !value.trim()) {
                            throw new Error("Enter value");
                          }
                        },
                      },
                    ]}
                    style={{ flex: 1, marginBottom: 0 }}
                  >
                    {isOptionsField ? (
                      <Select
                        placeholder={valuePlaceholder}
                        disabled={!hasSelectedCharacteristic}
                        options={getCharacteristicValueOptions(rowAttributeId)}
                      />
                    ) : (
                      <Input
                        placeholder={valuePlaceholder}
                        disabled={!hasSelectedCharacteristic}
                      />
                    )}
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
              Add characteristic
            </Button>
          </Flex>
        )}
      </Form.List>
    </Flex>
  </Card>
);
