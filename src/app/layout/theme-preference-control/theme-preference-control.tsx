import { MoonIcon } from "@phosphor-icons/react";
import { Tooltip } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

import { useThemeMode } from "@/theme/use-theme-mode";

import * as S from "./theme-preference-control.styled";

type ThemePreferenceControlProps =
  | {
      variant: "sider";
      showLabel: boolean;
    }
  | {
      variant: "drawer";
    };

export const ThemePreferenceControl = observer(
  (props: ThemePreferenceControlProps) => {
    const { t } = useTranslation();
    const { mode, preference, setPreference } = useThemeMode();
    const isAutoTheme = preference === "system";
    const variant = props.variant;
    const showLabel = variant === "drawer" ? true : props.showLabel;
    const ThemeSwitch =
      variant === "sider" ? S.SiderThemeSwitch : S.DrawerThemeSwitch;

    return (
      <Tooltip
        placement={variant === "sider" ? "right" : "top"}
        trigger={["hover", "click"]}
        title={
          isAutoTheme ? t("sidebar.themeAutoSwitchDisabledTooltip") : undefined
        }
      >
        <S.TooltipTarget>
          <S.Row
            $variant={variant}
            $showLabel={showLabel}
            $disabled={isAutoTheme}
            data-qa={
              variant === "drawer"
                ? "layout-mobile-navigation-theme-toggle"
                : undefined
            }
            onClick={() => {
              if (showLabel || isAutoTheme) {
                return;
              }

              setPreference(mode === "dark" ? "light" : "dark");
            }}
          >
            <S.Icon $variant={variant}>
              <MoonIcon size={20} />
            </S.Icon>

            {showLabel && <S.Label>{t("sidebar.darkTheme")}</S.Label>}

            {showLabel && (
              <ThemeSwitch
                size="small"
                checked={mode === "dark"}
                disabled={isAutoTheme}
                onChange={(checked) => {
                  setPreference(checked ? "dark" : "light");
                }}
              />
            )}
          </S.Row>
        </S.TooltipTarget>
      </Tooltip>
    );
  },
);
