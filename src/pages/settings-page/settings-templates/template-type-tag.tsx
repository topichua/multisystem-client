import { Tag } from "antd";
import { useTranslation } from "react-i18next";

import type { MessageTemplateType } from "@/features/message-templates/model/message-template.types";
import { BRAND_PRIMARY } from "@/styled/brand";

type TemplateTypeTagProps = {
  type: MessageTemplateType;
};

export const TemplateTypeTag = ({ type }: TemplateTypeTagProps) => {
  const { t } = useTranslation();

  return (
    <Tag
      color={type === "order" ? BRAND_PRIMARY : "default"}
      style={{ marginInlineEnd: 0, flexShrink: 0 }}
      data-qa={`template-type-tag-${type}`}
    >
      {t(`templates.types.${type}`)}
    </Tag>
  );
};
