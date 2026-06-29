import { Button as CommonButton } from "antd";
import styled from "styled-components";

import { dataQaAttrs } from "@/styled/data-qa-attrs";

const collapsedSiderWidth = "72px";
const expandedSiderWidth = "222px";

// const panelPadding = "8px";
const navItemSize = "40px";
// const siderRailWidth = `calc(${collapsedSiderWidth} - (${panelPadding} * 2))`;
const siderRailWidth = "50px";

const siderTransition = "0.22s ease";

export const Wrapper = styled.aside.attrs(() =>
  dataQaAttrs("layout-app-sider"),
)<{
  $isExpanded: boolean;
}>`
  width: ${(props) =>
    props.$isExpanded ? expandedSiderWidth : collapsedSiderWidth};
  min-width: ${(props) =>
    props.$isExpanded ? expandedSiderWidth : collapsedSiderWidth};
  height: 100%;
  background-color: ${(props) =>
    props.theme.colors.functional.background.elevated};
  border-right: 1px solid
    ${(props) => props.theme.colors.functional.border.cardBase};
  box-sizing: border-box;
  transition:
    width ${siderTransition},
    min-width ${siderTransition};

  @media (max-width: 767px) {
    display: none;
  }
`;

export const MenuSider = styled.div.attrs(() =>
  dataQaAttrs("layout-app-sider-nav"),
)<{
  $showLabel: boolean;
}>`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
  padding: 8px 0 0;
  box-sizing: border-box;
`;

export const Button = styled(CommonButton)<{ $showLabel: boolean }>`
  && {
    width: 100%;
    min-width: 0;
    height: ${navItemSize};
    padding: 0 !important;
    display: inline-flex;
    align-items: center;
    justify-content: flex-start;
    text-align: left;
    gap: 0;
    border-radius: ${(props) => props.theme.radius.medium};
    border-color: transparent !important;
    background-color: transparent !important;
    box-shadow: none !important;
    color: ${(props) => props.theme.colors.functional.text.subdued};
    overflow: hidden;
    transition:
      background-color 0.16s ease,
      color 0.16s ease;
  }

  && .ant-btn-icon {
    width: ${siderRailWidth};
    min-width: ${siderRailWidth};
    height: ${navItemSize};
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-inline-end: 0 !important;
    color: currentColor;
    line-height: 1;
  }

  .common-button-text {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    color: currentColor;
    font-size: ${(props) => props.theme.fontSize.medium};
    font-weight: 500;
    line-height: 1.3;
    text-overflow: ellipsis;
    white-space: nowrap;
    opacity: ${(props) => (props.$showLabel ? 1 : 0)};
    transition: opacity 0.12s ease;
  }

  &&:hover,
  &&:focus-visible {
    background-color: ${(props) =>
      props.theme.colors.functional.background.hover}!important;
    color: ${(props) => props.theme.colors.semantic.primary};
  }

  &&.active,
  &&.active:hover,
  &&.active:focus-visible {
    background-color: ${(props) =>
      props.theme.colors.functional.background.primary}!important;
    color: ${(props) => props.theme.colors.semantic.primary};
  }
`;

export const MenuSiderPanel = styled.div.attrs(() =>
  dataQaAttrs("layout-app-sider-panel"),
)<{
  $isExpanded: boolean;
}>`
  position: relative;
  overflow: hidden;
  padding: 12px 8px 24px 8px;
  box-shadow: none;
  background-color: ${(props) =>
    props.theme.colors.functional.background.elevated};
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
`;

export const SiderScrollArea = styled.div.attrs(() =>
  dataQaAttrs("layout-app-sider-scroll"),
)`
  flex: 1;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

export const SiderFooter = styled.div.attrs(() =>
  dataQaAttrs("layout-app-sider-footer"),
)`
  flex-shrink: 0;
  margin-top: auto;
  padding: 12px 0 0;
  border-top: 1px solid ${(props) => props.theme.colors.functional.border.split};
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
  box-sizing: border-box;
`;

export const FooterNav = styled.div<{ $showLabel: boolean }>`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
  box-sizing: border-box;
`;

export const PanelHeader = styled.div<{ $showLabel: boolean }>`
  position: relative;
  height: 44px;
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  box-sizing: border-box;
`;

export const Brand = styled.div.attrs(() =>
  dataQaAttrs("layout-app-sider-brand"),
)<{
  $showLabel: boolean;
  $interactive: boolean;
}>`
  width: 100%;
  min-width: 0;
  height: 40px;
  padding-right: ${(props) => (props.$showLabel ? "40px" : "0")};
  display: flex;
  align-items: center;
  border-radius: 8px;
  justify-content: flex-start;
  cursor: ${(props) => (props.$interactive ? "pointer" : "default")};
  overflow: hidden;
  box-sizing: border-box;

  &:focus-visible {
    outline: 2px solid
      ${(props) => props.theme.colors.functional.border.selected};
    outline-offset: 2px;
  }
`;

export const BrandLogoSlot = styled.span`
  width: ${siderRailWidth};
  min-width: ${siderRailWidth};
  height: ${navItemSize};
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

export const BrandLogo = styled.img`
  display: block;
  flex: 0 0 auto;
  width: 32px;
  height: 32px;
`;

export const BrandLogoText = styled.div`
  min-width: 0;
  overflow: hidden;
  color: ${(props) => props.theme.colors.functional.text.heading};
  font-size: 16px;
  font-weight: 800;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const CollapseButton = styled(CommonButton)`
  && {
    position: absolute;
    top: 4px;
    right: 0;
    width: 32px;
    min-width: 32px;
    height: 32px;
    padding: 0 !important;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid
      ${(props) => props.theme.colors.functional.border.selected}!important;
    border-radius: ${(props) => props.theme.radius.medium};
    background-color: ${(props) =>
      props.theme.colors.functional.background.elevated}!important;
    color: ${(props) => props.theme.colors.semantic.primary};
    box-shadow: none;
  }

  &&:hover,
  &&:focus-visible {
    border-color: ${(props) =>
      props.theme.colors.functional.border.selected}!important;
    background-color: ${(props) =>
      props.theme.colors.functional.background.primary}!important;
    color: ${(props) => props.theme.colors.semantic.primary};
  }
`;
