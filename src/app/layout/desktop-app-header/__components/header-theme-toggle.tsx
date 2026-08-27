import { MoonIcon, SunIcon } from "@phosphor-icons/react";
import { Tooltip } from "antd";
import { useTranslation } from "react-i18next";

import { useThemeMode } from "@/theme/use-theme-mode";

import * as S from "../desktop-app-header.styled";

export const HeaderThemeToggle = () => {
  const { t } = useTranslation();
  const { mode, preference, setPreference } = useThemeMode();
  const isAutoTheme = preference === "system";

  const handleThemeToggle = () => {
    if (isAutoTheme) {
      return;
    }

    setPreference(mode === "dark" ? "light" : "dark");
  };

  return (
    <Tooltip
      placement="bottom"
      title={
        isAutoTheme ? t("sidebar.themeAutoSwitchDisabledTooltip") : undefined
      }
    >
      <span>
        <S.IconButton
          type="text"
          disabled={isAutoTheme}
          aria-label={t("appHeader.toggleTheme")}
          data-qa="layout-desktop-theme-toggle"
          icon={
            mode === "dark" ? <SunIcon size={18} /> : <MoonIcon size={18} />
          }
          onClick={handleThemeToggle}
        />
      </span>
    </Tooltip>
  );
};
