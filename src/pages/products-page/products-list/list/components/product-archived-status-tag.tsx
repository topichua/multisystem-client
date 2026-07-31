import { Tag } from "@/components/tag/tag";
import { useTranslation } from "react-i18next";

const archivedTagStyle = {
  marginInlineEnd: 0,
  flexShrink: 0,
  padding: "1px 4px",
  fontSize: 11,
} as const;

export function ProductArchivedStatusTag() {
  const { t } = useTranslation();

  return <Tag style={archivedTagStyle}>{t("products.status.archived")}</Tag>;
}
