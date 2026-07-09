import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { Input } from "antd";
import { useTranslation } from "react-i18next";

type ExistingClientSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  onFocus: () => void;
};

export function ExistingClientSearchInput({
  value,
  onFocus,
  onChange,
}: ExistingClientSearchInputProps) {
  const { t } = useTranslation();

  return (
    <Input
      prefix={<MagnifyingGlassIcon size={18} />}
      placeholder={t("orders.create.client.existingSearchPlaceholder")}
      value={value}
      autoComplete="off"
      onFocus={onFocus}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
