import { Flex, Switch, Typography } from "antd";
import { useTranslation } from "react-i18next";

const { Text } = Typography;

type TemplateActiveToggleProps = {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
};

export const TemplateActiveToggle = ({
  checked = false,
  onChange,
}: TemplateActiveToggleProps) => {
  const { t } = useTranslation();

  return (
    <Flex align="center" gap={8} data-qa="template-active-toggle">
      <Switch
        size="small"
        checked={checked}
        onChange={onChange}
        aria-label={t("templates.activeAria")}
      />
      <Text type={checked ? undefined : "secondary"}>
        {checked ? t("templates.active") : t("templates.inactive")}
      </Text>
    </Flex>
  );
};
