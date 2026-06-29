import { Switch as CommonSwitch } from "antd";
import styled, { css } from "styled-components";

import { dataQaAttrs } from "@/styled/data-qa-attrs";

const navItemSize = "40px";
const siderRailWidth = "50px";

export type ThemePreferenceControlVariant = "sider" | "drawer";

export const TooltipTarget = styled.span`
  display: block;
  width: 100%;
`;

export const Row = styled.div<{
  $variant: ThemePreferenceControlVariant;
  $showLabel: boolean;
  $disabled: boolean;
}>`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  box-sizing: border-box;
  color: ${(props) => props.theme.colors.functional.text.subdued};
  opacity: ${(props) => (props.$disabled ? 0.72 : 1)};

  ${(props) =>
    props.$variant === "sider"
      ? css`
          height: ${navItemSize};
          padding: 0 !important;
          border-radius: ${props.theme.radius.medium};
          cursor: ${props.$disabled
            ? "not-allowed"
            : props.$showLabel
              ? "default"
              : "pointer"};
        `
      : css`
          min-height: 44px;
          padding: 4px 12px;
          border-radius: ${props.theme.radius.medium};
          cursor: ${props.$disabled ? "not-allowed" : "default"};
        `}
`;

export const Icon = styled.span<{ $variant: ThemePreferenceControlVariant }>`
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  color: currentColor;
  line-height: 1;

  ${(props) =>
    props.$variant === "sider"
      ? css`
          width: ${siderRailWidth};
          min-width: ${siderRailWidth};
          height: ${navItemSize};
        `
      : css`
          width: 36px;
          min-width: 36px;
          height: 36px;
        `}
`;

export const Label = styled.span`
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  color: currentColor;
  font-size: ${(props) => props.theme.fontSize.medium};
  font-weight: 500;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const SiderThemeSwitch = styled(CommonSwitch).attrs(() =>
  dataQaAttrs("layout-app-sider-theme-switch"),
)`
  flex: 0 0 auto;
`;

export const DrawerThemeSwitch = styled(CommonSwitch)`
  flex: 0 0 auto;
`;
