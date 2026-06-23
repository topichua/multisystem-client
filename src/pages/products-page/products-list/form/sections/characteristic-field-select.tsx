import {
  ListBulletsIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  TagIcon,
  TextTIcon,
} from "@phosphor-icons/react";
import { Button, Flex, Select, Typography } from "antd";
import { Tag } from "@/components/tag/tag";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

import type { VariantCustomField } from "@/features/products/model/product-create-api.types";

import type { CharacteristicFieldRef } from "../variants/product-add-variant.types";
import {
  getCharacteristicFieldStableKey,
  mapResponseFieldTypeToCreateFieldType,
  normalizeCharacteristicName,
} from "../variants/product-add-variant.utils";

const { Text } = Typography;

const DropdownHeader = styled.div`
  padding: 8px 12px;
  color: ${(props) => props.theme.colors.functional.text.subdued};
  font-size: 12px;
  letter-spacing: 0;
  text-transform: uppercase;
`;

const OptionContent = styled(Flex)`
  width: 100%;
`;

const CreatePanel = styled.div`
  padding: 12px;
`;

const CreateTypeButton = styled(Button)`
  height: auto;
  min-height: 72px;
  padding: 12px;
  justify-content: flex-start;
`;

type CharacteristicFieldSelectProps = {
  value?: CharacteristicFieldRef;
  availableFields: VariantCustomField[];
  selectedFields: CharacteristicFieldRef[];
  loading?: boolean;
  disabled?: boolean;
  placeholder: string;
  onChange?: (value: CharacteristicFieldRef | undefined) => void;
};

function getExistingOptionValue(field: VariantCustomField): string {
  return `existing:${field.id}`;
}

function getFieldValue(field: CharacteristicFieldRef): string {
  return getCharacteristicFieldStableKey(field);
}

function isSameField(
  left: CharacteristicFieldRef,
  right: CharacteristicFieldRef,
): boolean {
  return getFieldValue(left) === getFieldValue(right);
}

export function CharacteristicFieldSelect({
  value,
  availableFields,
  selectedFields,
  loading,
  disabled,
  placeholder,
  onChange,
}: CharacteristicFieldSelectProps) {
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState("");
  const [open, setOpen] = useState(false);

  const selectedExceptCurrent = useMemo(
    () =>
      selectedFields.filter(
        (selectedField) => !value || !isSameField(selectedField, value),
      ),
    [selectedFields, value],
  );

  const selectedExistingIds = useMemo(
    () =>
      new Set(
        selectedExceptCurrent.flatMap((field) =>
          field.kind === "existing" ? [field.id] : [],
        ),
      ),
    [selectedExceptCurrent],
  );

  const selectedNames = useMemo(() => {
    const names = new Set<string>();

    for (const field of selectedExceptCurrent) {
      if (field.kind === "new") {
        names.add(normalizeCharacteristicName(field.name));
      }
    }

    return names;
  }, [selectedExceptCurrent]);

  const normalizedSearch = normalizeCharacteristicName(searchValue);
  const hasMatchingExistingField = availableFields.some((field) =>
    normalizeCharacteristicName(field.label).includes(normalizedSearch),
  );
  const canCreate =
    normalizedSearch.length > 0 &&
    !hasMatchingExistingField &&
    !selectedNames.has(normalizedSearch);

  const options = [
    ...availableFields.map((field) => {
      const createType = mapResponseFieldTypeToCreateFieldType(field.type);
      const optionCount = field.options?.length ?? 0;

      return {
        value: getExistingOptionValue(field),
        label: field.label,
        disabled: selectedExistingIds.has(field.id),
        field,
        createType,
        optionCount,
      };
    }),
    ...(value?.kind === "new"
      ? [
          {
            value: getFieldValue(value),
            label: value.name,
            disabled: false,
            field: null,
            createType: value.type,
            optionCount: 0,
          },
        ]
      : []),
  ];

  const handleCreate = (type: "OPTION" | "TEXT") => {
    const name = searchValue.trim();
    if (!name) {
      return;
    }

    onChange?.({
      kind: "new",
      clientKey: crypto.randomUUID(),
      name,
      type,
    });
    setSearchValue("");
    setOpen(false);
  };

  return (
    <Select
      open={open}
      onOpenChange={setOpen}
      showSearch={{
        searchValue,
        onSearch: setSearchValue,
        filterOption: (input, option) =>
          String(option?.label ?? "")
            .toLocaleLowerCase()
            .includes(input.toLocaleLowerCase()),
      }}
      allowClear
      value={value ? getFieldValue(value) : undefined}
      placeholder={placeholder}
      loading={loading}
      disabled={disabled}
      suffixIcon={<MagnifyingGlassIcon />}
      optionLabelProp="label"
      onClear={() => onChange?.(undefined)}
      onChange={(nextValue) => {
        const existingField = availableFields.find(
          (field) => getExistingOptionValue(field) === nextValue,
        );

        onChange?.(
          existingField
            ? {
                kind: "existing",
                id: existingField.id,
              }
            : undefined,
        );
      }}
      popupRender={(menu) => (
        <>
          {!canCreate ? (
            <>
              <DropdownHeader>
                {t("products.characteristics.savedCharacteristics")}
              </DropdownHeader>
              {menu}
            </>
          ) : null}
          <CreatePanel>
            {canCreate ? (
              <Flex vertical gap={12}>
                <Text>
                  {t("products.characteristics.createAs", {
                    name: searchValue.trim(),
                  })}
                </Text>
                <Flex gap={12}>
                  <CreateTypeButton
                    block
                    icon={<TextTIcon size={20} />}
                    onClick={() => handleCreate("TEXT")}
                  >
                    <Flex vertical align="flex-start">
                      <Text strong>{t("products.characteristics.text")}</Text>
                      <Text type="secondary">
                        {t("products.characteristics.freeField")}
                      </Text>
                    </Flex>
                  </CreateTypeButton>
                  <CreateTypeButton
                    block
                    icon={<ListBulletsIcon size={20} />}
                    onClick={() => handleCreate("OPTION")}
                  >
                    <Flex vertical align="flex-start">
                      <Text strong>{t("products.characteristics.option")}</Text>
                      <Text type="secondary">
                        {t("products.characteristics.optionValues")}
                      </Text>
                    </Flex>
                  </CreateTypeButton>
                </Flex>
              </Flex>
            ) : (
              <Flex align="center" gap={8}>
                <PlusIcon />
                <Text type="secondary">
                  {t("products.characteristics.enterNameToCreate")}
                </Text>
              </Flex>
            )}
          </CreatePanel>
        </>
      )}
      options={options}
      optionRender={(option) => {
        const data = option.data as (typeof options)[number];
        return (
          <OptionContent align="center" justify="space-between" gap={12}>
            <Flex align="center" gap={8}>
              <TagIcon />
              <Text>{data.field?.label ?? data.label}</Text>
            </Flex>
            <Flex align="center" gap={8}>
              {data.createType === "OPTION" ? (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {t("products.characteristics.optionCount", {
                    count: data.optionCount,
                  })}
                </Text>
              ) : null}
              <Tag color="volcano">
                <Flex align="center" gap={4} style={{ width: "40px" }}>
                  {data.createType === "OPTION" ? (
                    <ListBulletsIcon />
                  ) : (
                    <TextTIcon />
                  )}
                  {data.createType === "OPTION"
                    ? t("products.characteristics.option")
                    : t("products.characteristics.text")}
                </Flex>
              </Tag>
            </Flex>
          </OptionContent>
        );
      }}
    />
  );
}
