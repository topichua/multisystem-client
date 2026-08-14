import { Segmented } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import {
  MESSAGE_TEMPLATE_LIST_FILTERS,
  type MessageTemplateListFilter,
} from "@/features/message-templates/model/message-template.types";

type TemplateTypeFilterProps = {
  value: MessageTemplateListFilter;
  onChange: (value: MessageTemplateListFilter) => void;
};

export const TemplateTypeFilter = ({
  value,
  onChange,
}: TemplateTypeFilterProps) => {
  const { t } = useTranslation();

  const options = useMemo(
    () =>
      MESSAGE_TEMPLATE_LIST_FILTERS.map((filter) => ({
        value: filter,
        label: t(`templates.filters.${filter}`),
      })),
    [t],
  );

  return (
    <Segmented<MessageTemplateListFilter>
      block
      value={value}
      options={options}
      onChange={onChange}
      aria-label={t("templates.filterAria")}
      data-qa="settings-templates-type-filter"
    />
  );
};
