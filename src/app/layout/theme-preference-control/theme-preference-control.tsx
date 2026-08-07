import { MoonIcon } from "@phosphor-icons/react";
import { Tooltip } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

import { useThemeMode } from "@/theme/use-theme-mode";

import * as S from "./theme-preference-control.styled";

export const ThemePreferenceControl = observer(() => {
  const { t } = useTranslation();
  const { mode, preference, setPreference } = useThemeMode();
  const isAutoTheme = preference === "system";

  return (
    <Tooltip
      placement="top"
      trigger={["hover", "click"]}
      title={
        isAutoTheme ? t("sidebar.themeAutoSwitchDisabledTooltip") : undefined
      }
    >
      <S.TooltipTarget>
        <S.Row
          $disabled={isAutoTheme}
          data-qa="layout-mobile-navigation-theme-toggle"
        >
          <S.Icon>
            <MoonIcon size={20} />
          </S.Icon>

          <S.Label>{t("sidebar.darkTheme")}</S.Label>

          <S.ThemeSwitch
            size="small"
            checked={mode === "dark"}
            disabled={isAutoTheme}
            onChange={(checked) => {
              setPreference(checked ? "dark" : "light");
            }}
          />
        </S.Row>
      </S.TooltipTarget>
    </Tooltip>
  );
});
