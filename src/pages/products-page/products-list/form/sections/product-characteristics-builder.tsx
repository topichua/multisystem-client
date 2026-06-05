import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { Button, Card, Flex, Form, Input } from "antd";
import { useTranslation } from "react-i18next";

import type { VariantCustomField } from "@/features/products/model/product-create-api.types";
import type { CharacteristicFieldRef } from "../variants/product-add-variant.types";
import {
  getCharacteristicFieldType,
  normalizeCharacteristicName,
} from "../variants/product-add-variant.utils";
import { CharacteristicFieldSelect } from "./characteristic-field-select";
import { CharacteristicOptionValueSelect } from "./characteristic-option-value-select";
import { SortableCharacteristicRow } from "./sortable-characteristic-row";
import {
  moveSortableFormListItem,
  useSortableFormListSensors,
} from "./use-sortable-form-list";

export type ProductCharacteristicBuilderRow = {
  field?: CharacteristicFieldRef;
  attributeId?: number;
  values?: string[];
  value?: string;
};

type ProductCharacteristicsBuilderProps = {
  watchedCharacteristics: ProductCharacteristicBuilderRow[] | undefined;
  variantCustomFields: VariantCustomField[];
  isVariantCustomFieldsLoading: boolean;
  getCharacteristicValueOptions: (
    attributeId?: number,
  ) => Array<{ value: string; label: string }>;
};

export function ProductCharacteristicsBuilder({
  watchedCharacteristics,
  variantCustomFields,
  isVariantCustomFieldsLoading,
  getCharacteristicValueOptions,
}: ProductCharacteristicsBuilderProps) {
  const { t } = useTranslation();
  const form = Form.useFormInstance();
  const sensors = useSortableFormListSensors();
  const selectedFields = Array.isArray(watchedCharacteristics)
    ? watchedCharacteristics.flatMap((row) => (row.field ? [row.field] : []))
    : [];

  return (
    <Card size="small" title={t("products.characteristics.title")}>
      <Form.List name="characteristics">
        {(fields, { add, remove, move }) => {
          const rowIds = fields.map((field) => field.key);

          return (
            <Flex vertical gap={12}>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(event) =>
                  moveSortableFormListItem(fields, move, event)
                }
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
                        rowField?.kind === "existing" ? rowField.id : undefined;
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
                                ["characteristics", field.name, "attributeId"],
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
                                      t("products.characteristics.enterName"),
                                    );
                                  }
                                },
                              },
                            ]}
                            style={{ width: 380, marginBottom: 0 }}
                          >
                            <CharacteristicFieldSelect
                              placeholder={t("products.characteristics.choose")}
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
  );
}
