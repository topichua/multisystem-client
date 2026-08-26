import { useTranslation } from "react-i18next";

import { Tag } from "@/components/tag/tag";
import { BRAND_PRIMARY } from "@/styled/brand";

const badgeStyle = {
  flexShrink: 0,
  minHeight: 20,
  paddingInline: 8,
  fontSize: 11,
  lineHeight: "18px",
} as const;

export const ConversationGroupSystemBadge = () => {
  const { t } = useTranslation();

  return (
    <Tag
      color={BRAND_PRIMARY}
      style={badgeStyle}
      data-qa="conversation-group-system-badge"
    >
      {t("groups.systemBadge")}
    </Tag>
  );
};
