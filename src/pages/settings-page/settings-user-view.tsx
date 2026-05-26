import { Empty } from "antd";
import { useTranslation } from "react-i18next";

export const SettingsUserView = () => {
  const { t } = useTranslation();
  return (
    <div style={{ padding: "12px 24px" }}>
      <Empty description={t("userSettings.placeholder")} />
    </div>
  );
};
