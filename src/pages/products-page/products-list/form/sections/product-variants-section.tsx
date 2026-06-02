import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { Button, Card, Flex, Form, Input, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useTranslation } from "react-i18next";
import type { VariantCustomField } from "@/features/products/model/product-create-api.types";
import type {
  CharacteristicFieldRef,
  ProductVariantUi,
} from "../variants/product-add-variant.types";
import {
  getCharacteristicFieldType,
  normalizeCharacteristicName,
} from "../variants/product-add-variant.utils";
import { CharacteristicFieldSelect } from "./characteristic-field-select";
import { CharacteristicOptionValueSelect } from "./characteristic-option-value-select";
import { SortableCharacteristicRow } from "./sortable-characteristic-row";

const { Title, Text } = Typography;

type CharacteristicRow = {
  field?: CharacteristicFieldRef;
  attributeId?: number;
  values?: string[];
  value?: string;
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
  getCharacteristicValueOptions,
  onAddManualVariant,
}: ProductVariantsSectionProps) => {
  const { t } = useTranslation();
  const form = Form.useFormInstance();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const selectedFields = Array.isArray(watchedCharacteristics)
    ? watchedCharacteristics.flatMap((row) => (row.field ? [row.field] : []))
    : [];

  return (
    <Card>
      <Flex vertical gap={24}>
        <Flex vertical gap={4}>
          <Title level={5} style={{ margin: 0 }}>
            {t("products.variantsForm.title")}
          </Title>

          <Text type="secondary">{t("products.variantsForm.description")}</Text>
        </Flex>

        <Card size="small" title={t("products.characteristics.title")}>
          <Form.List name="characteristics">
            {(fields, { add, remove, move }) => {
              const rowIds = fields.map((field) => field.key);
              const handleDragEnd = (event: DragEndEvent) => {
                const { active, over } = event;
                if (over == null || active.id === over.id) {
                  return;
                }

                const oldIndex = fields.findIndex(
                  (field) => field.key === active.id,
                );
                const newIndex = fields.findIndex(
                  (field) => field.key === over.id,
                );
                if (oldIndex < 0 || newIndex < 0) {
                  return;
                }

                move(oldIndex, newIndex);
              };

              return (
                <Flex vertical gap={12}>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={rowIds}
                      strategy={verticalListSortingStrategy}
                    >
                      <Flex vertical gap={12}>
                        {fields.map((field) => {
                          const row = Array.isArray(watchedCharacteristics)
                            ? watchedCharacteristics[field.name]
                            : undefined;
                          const rowField =
                            row?.field ??
                            (typeof row?.attributeId === "number" &&
                            Number.isFinite(row.attributeId)
                              ? ({
                                  kind: "existing",
                                  id: row.attributeId,
                                } satisfies CharacteristicFieldRef)
                              : undefined);
                          const hasSelectedCharacteristic = rowField != null;
                          const fieldType = rowField
                            ? getCharacteristicFieldType(
                                rowField,
                                variantCustomFields,
                              )
                            : null;
                          const rowAttributeId =
                            rowField?.kind === "existing"
                              ? rowField.id
                              : undefined;
                          const valuesPlaceholder = !hasSelectedCharacteristic
                            ? t("products.characteristics.chooseFirst")
                            : fieldType === "OPTION"
                              ? t("products.characteristics.addValues")
                              : t("products.characteristics.addCustomValues");

                          return (
                            <SortableCharacteristicRow
                              key={field.key}
                              id={field.key}
                              dragLabel={t("products.characteristics.dragRow")}
                            >
                              <Form.Item
                                name={[field.name, "field"]}
                                getValueFromEvent={(
                                  nextField: CharacteristicFieldRef | undefined,
                                ) => {
                                  form.setFieldValue(
                                    [
                                      "characteristics",
                                      field.name,
                                      "attributeId",
                                    ],
                                    nextField?.kind === "existing"
                                      ? nextField.id
                                      : undefined,
                                  );
                                  form.setFieldValue(
                                    ["characteristics", field.name, "values"],
                                    undefined,
                                  );
                                  form.setFieldValue(
                                    ["characteristics", field.name, "value"],
                                    undefined,
                                  );
                                  return nextField;
                                }}
                                rules={[
                                  {
                                    validator: async (_, nextField) => {
                                      if (!nextField) {
                                        throw new Error(
                                          t("products.characteristics.choose"),
                                        );
                                      }

                                      if (
                                        nextField.kind === "new" &&
                                        (!nextField.name.trim() ||
                                          !normalizeCharacteristicName(
                                            nextField.name,
                                          ))
                                      ) {
                                        throw new Error(
                                          t(
                                            "products.characteristics.enterName",
                                          ),
                                        );
                                      }
                                    },
                                  },
                                ]}
                                style={{ width: 380, marginBottom: 0 }}
                              >
                                <CharacteristicFieldSelect
                                  placeholder={t(
                                    "products.characteristics.choose",
                                  )}
                                  availableFields={variantCustomFields}
                                  selectedFields={selectedFields}
                                  loading={isVariantCustomFieldsLoading}
                                  disabled={isVariantCustomFieldsLoading}
                                />
                              </Form.Item>

                              {fieldType === "TEXT" ? (
                                <Form.Item
                                  name={[field.name, "value"]}
                                  rules={[
                                    {
                                      required: true,
                                      message: t(
                                        "products.characteristics.enterValue",
                                      ),
                                    },
                                  ]}
                                  style={{ flex: 1, marginBottom: 0 }}
                                >
                                  <Input
                                    disabled={!hasSelectedCharacteristic}
                                    placeholder={valuesPlaceholder}
                                  />
                                </Form.Item>
                              ) : (
                                <Form.Item
                                  name={[field.name, "values"]}
                                  rules={[
                                    {
                                      required: true,
                                      message: t(
                                        "products.characteristics.addValues",
                                      ),
                                    },
                                  ]}
                                  style={{ flex: 1, marginBottom: 0 }}
                                >
                                  <CharacteristicOptionValueSelect
                                    options={getCharacteristicValueOptions(
                                      rowAttributeId,
                                    )}
                                    disabled={!hasSelectedCharacteristic}
                                    placeholder={valuesPlaceholder}
                                  />
                                </Form.Item>
                              )}

                              <Button
                                danger
                                icon={<TrashIcon />}
                                onClick={() => remove(field.name)}
                              />
                            </SortableCharacteristicRow>
                          );
                        })}
                      </Flex>
                    </SortableContext>
                  </DndContext>

                  <Button
                    icon={<PlusIcon />}
                    onClick={() => add()}
                    style={{ alignSelf: "flex-start" }}
                  >
                    {t("products.characteristics.add")}
                  </Button>
                </Flex>
              );
            }}
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
