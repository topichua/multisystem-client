import { PlusIcon } from "@phosphor-icons/react";
import { Button, Divider, Flex, Select, Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { CharacteristicTypeTag } from "@/features/characteristics/components/characteristic-type-tag";
import type { VariantCustomField } from "@/features/products/model/product-create-api.types";
import { getDraftCustomFieldFilter } from "@/features/products/model/products-list-custom-field-filters";
import { useProductsStore } from "@/features/products/model/use-products-store";

import { CustomFieldFilterRow } from "./products-list-custom-field-filter-row";

const { Text } = Typography;

function fieldDisplayLabel(field: VariantCustomField): string {
  const displayName = field.displayName?.trim();
  return displayName || field.label;
}

type ProductsListCustomFieldFiltersSectionProps = {
  fields: VariantCustomField[];
};

export const ProductsListCustomFieldFiltersSection = observer(
  ({ fields }: ProductsListCustomFieldFiltersSectionProps) => {
    const { t } = useTranslation();
    const productsStore = useProductsStore();
    const [pickerOpen, setPickerOpen] = useState(false);
    const selectRef = useRef<{ focus: () => void } | null>(null);

    const activeFields = useMemo(
      () => fields.filter((field) => field.archivedAt == null),
      [fields],
    );

    const fieldById = useMemo(
      () => new Map(activeFields.map((field) => [field.id, field])),
      [activeFields],
    );

    const selectedFieldIds = productsStore.draftSelectedCustomFieldIds;
    const selectedFields = selectedFieldIds
      .map((id) => fieldById.get(id))
      .filter((field): field is VariantCustomField => field != null);

    const showFieldPicker = pickerOpen || selectedFieldIds.length > 0;

    useEffect(() => {
      if (!pickerOpen) {
        return;
      }
      const frame = window.requestAnimationFrame(() => {
        selectRef.current?.focus();
      });
      return () => window.cancelAnimationFrame(frame);
    }, [pickerOpen]);

    if (activeFields.length === 0) {
      return null;
    }

    return (
      <>
        <Divider style={{ margin: 0 }} />
        <div>
          <Text strong style={{ display: "block", marginBottom: 8 }}>
            {t("products.listFilters.panelFieldsSection")}
          </Text>

          <Flex vertical gap={12}>
            {!showFieldPicker ? (
              <Button
                block
                color="primary"
                variant="dashed"
                icon={<PlusIcon size={16} />}
                onClick={() => setPickerOpen(true)}
              >
                {t("products.listFilters.panelAddField")}
              </Button>
            ) : (
              <Select
                ref={selectRef as never}
                mode="multiple"
                allowClear
                showSearch={{ optionFilterProp: "label" }}
                open={pickerOpen}
                onOpenChange={setPickerOpen}
                placeholder={t(
                  "products.listFilters.panelFieldsSelectPlaceholder",
                )}
                style={{ width: "100%" }}
                value={selectedFieldIds}
                options={activeFields.map((field) => ({
                  value: field.id,
                  label: fieldDisplayLabel(field),
                }))}
                optionRender={(option) => {
                  const field = fieldById.get(Number(option.value));

                  return (
                    <Flex align="center" justify="space-between" gap={8}>
                      <span>{option.label}</span>
                      {field && <CharacteristicTypeTag type={field.type} />}
                    </Flex>
                  );
                }}
                onChange={(ids: number[]) => {
                  productsStore.setDraftSelectedCustomFieldIds(ids);
                  if (ids.length === 0) {
                    setPickerOpen(false);
                  }
                }}
              />
            )}

            {selectedFields.map((field) => (
              <CustomFieldFilterRow
                key={field.id}
                field={field}
                draft={getDraftCustomFieldFilter(
                  productsStore.draftCustomFieldFilters,
                  field.id,
                )}
                onChange={(next) =>
                  productsStore.setDraftCustomFieldFilter(field.id, next)
                }
              />
            ))}
          </Flex>
        </div>
      </>
    );
  },
);
