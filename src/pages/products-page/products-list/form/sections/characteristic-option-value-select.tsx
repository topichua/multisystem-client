import { PlusIcon } from "@phosphor-icons/react";
import { Flex, Select, Typography } from "antd";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

import { normalizeCharacteristicName } from "../variants/product-add-variant.utils";

const { Text } = Typography;

const AddValueRow = styled.button`
  width: 100%;
  border: 0;
  background: transparent;
  padding: 14px 20px;
  cursor: pointer;
  text-align: left;

  &:hover {
    background: ${(props) => props.theme.colors.functional.background.hover};
  }
`;

const AddValueIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  color: #fff;
  background: ${(props) => props.theme.colors.functional.border.selected};
  flex-shrink: 0;
`;

type CharacteristicOptionValueSelectProps = {
  value?: string[];
  placeholder: string;
  disabled: boolean;
  options: Array<{ value: string; label: string }>;
  maxCount?: number;
  onChange?: (value: string[] | undefined) => void;
};

type SingleCharacteristicOptionValueSelectProps = {
  value?: string;
  placeholder: string;
  disabled: boolean;
  options: Array<{ value: string; label: string }>;
  onChange?: (value: string | undefined) => void;
};

function normalizeValues(values: string[], maxCount?: number): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const rawValue of values) {
    const value = rawValue.trim();
    const normalizedValue = normalizeCharacteristicName(value);
    if (!value || seen.has(normalizedValue)) {
      continue;
    }

    seen.add(normalizedValue);
    normalized.push(value);
  }

  if (maxCount === 1 && normalized.length > 1) {
    return normalized.slice(-1);
  }

  return normalized;
}

export function CharacteristicOptionValueSelect({
  value,
  placeholder,
  disabled,
  options,
  maxCount,
  onChange,
}: CharacteristicOptionValueSelectProps) {
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState("");
  const [open, setOpen] = useState(false);
  const selectedValues = value ?? [];

  const normalizedSearch = normalizeCharacteristicName(searchValue);
  const hasMatchingOption = useMemo(
    () =>
      normalizedSearch.length > 0 &&
      options.some((option) =>
        normalizeCharacteristicName(`${option.label} ${option.value}`).includes(
          normalizedSearch,
        ),
      ),
    [normalizedSearch, options],
  );
  const hasSelectedValue = selectedValues.some(
    (selectedValue) =>
      normalizeCharacteristicName(selectedValue) === normalizedSearch,
  );
  const canAdd =
    normalizedSearch.length > 0 && !hasMatchingOption && !hasSelectedValue;

  const commitValues = (nextValues: string[]) => {
    const normalizedValues = normalizeValues(nextValues, maxCount);
    onChange?.(normalizedValues.length > 0 ? normalizedValues : undefined);
  };

  const handleAddValue = () => {
    const nextValue = searchValue.trim();
    if (!nextValue) {
      return;
    }

    commitValues(maxCount === 1 ? [nextValue] : [...selectedValues, nextValue]);
    setSearchValue("");
    setOpen(false);
  };

  return (
    <Select
      mode="tags"
      open={open}
      onOpenChange={setOpen}
      value={selectedValues}
      placeholder={placeholder}
      disabled={disabled}
      options={options}
      maxCount={maxCount}
      tokenSeparators={[","]}
      notFoundContent={canAdd ? null : undefined}
      showSearch={{
        searchValue,
        onSearch: setSearchValue,
        filterOption: (input, option) =>
          String(option?.label ?? "")
            .toLocaleLowerCase()
            .includes(input.toLocaleLowerCase()),
      }}
      onChange={(values) => commitValues(values)}
      popupRender={(menu) =>
        canAdd ? (
          <AddValueRow
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={handleAddValue}
          >
            <Flex align="center" gap={12}>
              <AddValueIcon>
                <PlusIcon size={18} />
              </AddValueIcon>
              <Text>
                {t("products.characteristics.addOptionValue", {
                  value: searchValue.trim(),
                })}{" "}
                <Text type="secondary">
                  {t("products.characteristics.savedToList")}
                </Text>
              </Text>
            </Flex>
          </AddValueRow>
        ) : (
          menu
        )
      }
    />
  );
}

export function SingleCharacteristicOptionValueSelect({
  value,
  placeholder,
  disabled,
  options,
  onChange,
}: SingleCharacteristicOptionValueSelectProps) {
  return (
    <CharacteristicOptionValueSelect
      value={value ? [value] : []}
      placeholder={placeholder}
      disabled={disabled}
      options={options}
      maxCount={1}
      onChange={(values) => onChange?.(values?.[0])}
    />
  );
}
