import { Checkbox, Input, Select, Typography } from "antd";
import { useTranslation } from "react-i18next";

import type { VariantCustomField } from "@/features/products/model/product-create-api.types";
import type { ProductsListCustomFieldFilter } from "@/features/products/model/products-list-custom-field-filters";

const { Text } = Typography;

function fieldDisplayLabel(field: VariantCustomField): string {
  const displayName = field.displayName?.trim();
  return displayName || field.label;
}

function activeOptions(field: VariantCustomField) {
  return (field.options ?? []).filter((option) => option.archivedAt == null);
}

type CustomFieldFilterRowProps = {
  field: VariantCustomField;
  draft: ProductsListCustomFieldFilter | undefined;
  onChange: (next: ProductsListCustomFieldFilter | null) => void;
};

export const CustomFieldFilterRow = ({
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
