import {
  ListBulletsIcon,
  PlusIcon,
  TextTIcon,
} from "@phosphor-icons/react";
import { Checkbox, Divider, Flex, Input, Select, Typography, theme } from "antd";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import type { VariantCustomField } from "@/features/products/model/product-create-api.types";
import type { ProductsListCustomFieldFilter } from "@/features/products/model/products-list-custom-field-filters";
import { getDraftCustomFieldFilter } from "@/features/products/model/products-list-custom-field-filters";
import { useProductsStore } from "@/features/products/model/use-products-store";

const { Text } = Typography;

function fieldDisplayLabel(field: VariantCustomField): string {
  const displayName = field.displayName?.trim();
  return displayName || field.label;
}

function activeOptions(field: VariantCustomField) {
  return (field.options ?? []).filter((option) => option.archivedAt == null);
}

type ProductsListCustomFieldFiltersSectionProps = {
  fields: VariantCustomField[];
};

export const ProductsListCustomFieldFiltersSection = observer(
  ({ fields }: ProductsListCustomFieldFiltersSectionProps) => {
    const { t } = useTranslation();
    const { token } = theme.useToken();
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
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  width: "100%",
                  padding: "10px 12px",
                  border: `1px dashed ${token.colorBorder}`,
                  borderRadius: token.borderRadius,
                  background: "transparent",
                  color: token.colorPrimary,
                  cursor: "pointer",
                }}
              >
                <PlusIcon size={16} />
                <span>{t("products.listFilters.panelAddField")}</span>
              </button>
            ) : (
              <Select
                ref={selectRef as never}
                mode="multiple"
                allowClear
                showSearch
                open={pickerOpen}
                onOpenChange={setPickerOpen}
                optionFilterProp="label"
                placeholder={t(
                  "products.listFilters.panelFieldsSelectPlaceholder",
                )}
                style={{ width: "100%" }}
                value={selectedFieldIds}
                options={activeFields.map((field) => ({
                  value: field.id,
                  label: fieldDisplayLabel(field),
                  fieldType: field.type,
                }))}
                optionRender={(option) => {
                  const fieldType = (
                    option.data as { fieldType?: "options" | "text" }
                  ).fieldType;
                  return (
                    <Flex align="center" gap={8}>
                      {fieldType === "text" ? (
                        <TextTIcon size={16} />
                      ) : (
                        <ListBulletsIcon size={16} />
                      )}
                      <span>{option.label}</span>
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

type CustomFieldFilterRowProps = {
  field: VariantCustomField;
  draft: ProductsListCustomFieldFilter | undefined;
  onChange: (next: ProductsListCustomFieldFilter | null) => void;
};

const CustomFieldFilterRow = ({
  field,
  draft,
  onChange,
}: CustomFieldFilterRowProps) => {
  const { t } = useTranslation();
  const label = fieldDisplayLabel(field);
  const anyValue = draft?.mode === "all";

  if (field.type === "options") {
    const options = activeOptions(field);
    const selectedIds =
      draft?.mode === "options" ? draft.optionIds : ([] as number[]);

    return (
      <div>
        <Text style={{ display: "block", marginBottom: 6 }}>{label}</Text>
        <Checkbox
          checked={anyValue}
          onChange={(e) => {
            if (e.target.checked) {
              onChange({ fieldId: field.id, mode: "all" });
              return;
            }
            onChange(null);
          }}
          style={{ marginBottom: 8 }}
        >
          {t("products.listFilters.panelFieldAnyValue")}
        </Checkbox>
        <Select
          mode="multiple"
          allowClear
          showSearch
          optionFilterProp="label"
          disabled={anyValue}
          placeholder={t("products.listFilters.panelFieldOptionsPlaceholder")}
          style={{ width: "100%" }}
          value={selectedIds}
          options={options.map((option) => ({
            value: option.id,
            label: option.label,
          }))}
          onChange={(ids: number[]) => {
            if (ids.length === 0) {
              onChange(null);
              return;
            }
            onChange({
              fieldId: field.id,
              mode: "options",
              optionIds: ids,
            });
          }}
        />
      </div>
    );
  }

  const textValue = draft?.mode === "text" ? draft.value : "";

  return (
    <div>
      <Text style={{ display: "block", marginBottom: 6 }}>{label}</Text>
      <Checkbox
        checked={anyValue}
        onChange={(e) => {
          if (e.target.checked) {
            onChange({ fieldId: field.id, mode: "all" });
            return;
          }
          onChange(null);
        }}
        style={{ marginBottom: 8 }}
      >
        {t("products.listFilters.panelFieldAnyValue")}
      </Checkbox>
      <Input
        allowClear
        disabled={anyValue}
        placeholder={t("products.listFilters.panelFieldTextPlaceholder")}
        value={textValue}
        onChange={(e) => {
          const next = e.target.value;
          if (!next.trim()) {
            onChange(null);
            return;
          }
          onChange({
            fieldId: field.id,
            mode: "text",
            value: next,
          });
        }}
      />
    </div>
  );
};
