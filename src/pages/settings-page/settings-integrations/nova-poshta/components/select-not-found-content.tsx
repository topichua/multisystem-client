import { Spin } from "antd";
import { useTranslation } from "react-i18next";

type SelectNotFoundContentProps = {
  failed: boolean;
  loading: boolean;
  minSearchLength?: number;
};

export function SelectNotFoundContent({
  failed,
  loading,
  minSearchLength = 0,
}: SelectNotFoundContentProps) {
  const { t } = useTranslation();

  if (loading) {
    return <Spin size="small" />;
  }

  if (failed) {
    return t("integrations.novaPoshtaWizard.searchFailed");
  }

  if (minSearchLength > 0) {
    return t("integrations.novaPoshtaWizard.searchMinLength", {
      count: minSearchLength,
    });
  }

  return t("integrations.novaPoshtaWizard.searchEmpty");
}
