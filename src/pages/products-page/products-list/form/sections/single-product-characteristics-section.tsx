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
import { Button, Card, Flex, Form, Input, Typography } from "antd";
import type { FormInstance } from "antd";
import { useTranslation } from "react-i18next";
import type { VariantCustomField } from "@/features/products/model/product-create-api.types";
import type { CharacteristicFieldRef } from "../variants/product-add-variant.types";
import {
  getCharacteristicFieldType,
  normalizeCharacteristicName,
} from "../variants/product-add-variant.utils";
import { CharacteristicFieldSelect } from "./characteristic-field-select";
import { SingleCharacteristicOptionValueSelect } from "./characteristic-option-value-select";
import { SortableCharacteristicRow } from "./sortable-characteristic-row";

const { Title, Text } = Typography;

type SingleCharacteristicRow = {
  field?: CharacteristicFieldRef;
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
  getCharacteristicValueOptions,
}: SingleProductCharacteristicsSectionProps) => {
  const { t } = useTranslation();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const selectedFields = Array.isArray(watchedSingleCharacteristics)
    ? watchedSingleCharacteristics.flatMap((row) =>
        row.field ? [row.field] : [],
      )
    : [];

  return (
    <Card>
      <Flex vertical gap={24}>
        <Flex vertical gap={4}>
          <Title level={5} style={{ margin: 0 }}>
            {t("products.characteristics.title")}
          </Title>

          <Text type="secondary">
            {t("products.characteristics.singleDescription")}
          </Text>
        </Flex>

        <Form.List name="singleCharacteristics">
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
                        const row = Array.isArray(watchedSingleCharacteristics)
                          ? watchedSingleCharacteristics[field.name]
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
                        const isOptionsField = fieldType === "OPTION";
                        const rowAttributeId =
                          rowField?.kind === "existing"
                            ? rowField.id
                            : undefined;
                        const valuePlaceholder = !hasSelectedCharacteristic
                          ? t("products.characteristics.chooseFirst")
                          : isOptionsField
                            ? t("products.characteristics.chooseValue")
                            : t("products.characteristics.enterCustomValue");

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
                                    "singleCharacteristics",
                                    field.name,
                                    "attributeId",
                                  ],
                                  nextField?.kind === "existing"
                                    ? nextField.id
                                    : undefined,
                                );
                                form.setFieldValue(
                                  [
                                    "singleCharacteristics",
                                    field.name,
                                    "value",
                                  ],
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
                                        t("products.characteristics.enterName"),
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

                            <Form.Item
                              name={[field.name, "value"]}
                              rules={[
                                {
                                  required: true,
                                  message: t(
                                    "products.characteristics.enterValue",
                                  ),
                                },
                                {
                                  validator: async (_, value) => {
                                    if (
                                      typeof value !== "string" ||
                                      !value.trim()
                                    ) {
                                      throw new Error(
                                        t(
                                          "products.characteristics.enterValue",
                                        ),
                                      );
                                    }
                                  },
                                },
                              ]}
                              style={{ flex: 1, marginBottom: 0 }}
                            >
                              {isOptionsField ? (
                                <SingleCharacteristicOptionValueSelect
                                  placeholder={valuePlaceholder}
                                  disabled={!hasSelectedCharacteristic}
                                  options={getCharacteristicValueOptions(
                                    rowAttributeId,
                                  )}
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
      </Flex>
    </Card>
  );
};
