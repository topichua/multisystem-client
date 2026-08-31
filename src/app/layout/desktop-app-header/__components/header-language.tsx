import { CheckIcon } from "@phosphor-icons/react";
import { Button, Dropdown, Flex, Typography } from "antd";
import type { MenuProps } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

import {
  LANGUAGE_OPTIONS,
  useWorkspaceLanguage,
} from "@/features/workspace-settings/model/use-workspace-language";

export const HeaderLanguage = observer(() => {
  const { t } = useTranslation();
  const { language, languageDisabled, changeLanguage } = useWorkspaceLanguage();

  const handleLanguageClick: NonNullable<MenuProps["onClick"]> = ({ key }) => {
    void changeLanguage(key);
  };

  const languageMenuItems: MenuProps["items"] = Object.entries(
    LANGUAGE_OPTIONS,
  ).map(([key, option]) => {
    const selected = key === language;

    return {
      key,
      disabled: languageDisabled,
      label: (
        <Flex align="center" justify="space-between" gap={16}>
          <Flex align="center" gap={14}>
            <Typography.Text type={selected ? undefined : "secondary"} strong>
              {option.code}
            </Typography.Text>

            <Typography.Text type={selected ? undefined : "secondary"}>
              {t(option.labelKey)}
            </Typography.Text>
          </Flex>

          {selected && <CheckIcon size={14} color="purple" weight="bold" />}
        </Flex>
      ),
    };
  });

  return (
    <Dropdown
      trigger={["click"]}
      placement="bottomRight"
      menu={{
        items: languageMenuItems,
        selectedKeys: [language],
        onClick: handleLanguageClick,
      }}
    >
      <Button
        type="text"
        disabled={languageDisabled}
        aria-label={t("appHeader.changeLanguage")}
        data-qa="layout-desktop-language-dropdown"
        style={{ paddingLeft: 8, paddingRight: 8 }}
      >
        {LANGUAGE_OPTIONS[language].code}
      </Button>
    </Dropdown>
  );
});
