import styled, { keyframes, css } from "styled-components";

import { Button as CommonButton } from "antd";

import { dataQaAttrs } from "@/styled/data-qa-attrs";

export const Wrapper = styled.aside.attrs(() =>
  dataQaAttrs("layout-app-sider"),
)`
  padding: 8px 0;
  width: fit-content;
  height: 100%;
  background-color: ${(props) => props.theme.colors.base.grey[1]};
  border-right: 1px solid
    ${(props) => props.theme.colors.functional.border.cardBase};
  box-sizing: border-box;

  @media (max-width: 767px) {
    display: none;
  }
`;

export const MenuSider = styled.div.attrs(() =>
  dataQaAttrs("layout-app-sider-nav"),
)<{
  $showLabel: boolean;
}>`
  width: max-content;
  display: flex;
  flex-direction: column;
  align-items: ${(props) => (props.$showLabel ? "stretch" : "center")};
  gap: 16px;
  padding: 0 8px;
  box-sizing: border-box;

  &&&&& .ant-btn {
    background-color: transparent !important;
    border-color: transparent !important;
    box-shadow: none !important;
    transition: none !important;

    &:hover {
      border-color: ${(props) =>
        props.theme.colors.functional.border.primary}!important;
    }

    &.active,
    &:active,
    &:focus {
      background-color: ${(props) =>
        props.theme.colors.brandPalette[1]}!important;
      border-color: ${(props) =>
        props.theme.colors.functional.border.selected}!important;

      &:hover {
        background-color: ${(props) =>
          props.theme.colors.brandPalette[1]}!important;
        border-color: ${(props) =>
          props.theme.colors.functional.border.selected}!important;
      }
    }
  }
`;

const fadeIn = keyframes`
  from { opacity: 0.5; }
  to { opacity: 1; }
`;

export const Button = styled(CommonButton)<{ $showLabel: boolean }>`
  border-radius: 8px;
  padding: 6px !important;
  width: ${(props) => (props.$showLabel ? "100%" : "auto")};
  transition: none !important;

  .common-button-text {
    color: ${(props) => props.theme.colors.base.grey[8]};
    font-weight: 500;
    opacity: 1;

    animation: ${(props) =>
      props.$showLabel
        ? css`
            ${fadeIn} 0.1s ease-in
          `
        : "none"};
  }

  &.active {
    width: 100%;

    & .anticon,
    & .ant-btn-icon {
      color: ${(props) => props.theme.colors.semantic.primary};
    }
  }

  &.active .common-button-text {
    color: ${(props) => props.theme.colors.semantic.primary}!important;
  }

  & .anticon,
  & .ant-btn-icon {
    color: ${(props) => props.theme.colors.base.grey[7]};
  }

  &:hover {
    color: ${(props) => props.theme.colors.semantic.primary}!important;
    background: ${(props) => props.theme.colors.functional.background.primary};

    & .anticon,
    & .ant-btn-icon {
      color: ${(props) => props.theme.colors.semantic.primary};
    }
  }
`;

const sliderPanelShadow =
  "477px 0 134px 0 rgba(78, 87, 119, 0.00), 305px 0 122px 0 rgba(78, 87, 119, 0.01), 172px 0 103px 0 rgba(78, 87, 119, 0.02), 76px 0 76px 0 rgba(78, 87, 119, 0.04), 19px 0 42px 0 rgba(78, 87, 119, 0.05)";

const fadeInShadow = keyframes`
  from { box-shadow: none; }
  to { box-shadow: ${sliderPanelShadow} ; }
`;

export const MenuSiderPanel = styled.div.attrs(() =>
  dataQaAttrs("layout-app-sider-panel"),
)<{
  $isDrawerOpen: boolean;
}>`
  position: fixed;
  overflow: hidden;
  top: 0;
  left: 0;
  padding: 8px;
  box-shadow: ${(props) => (props.$isDrawerOpen ? sliderPanelShadow : "none")};
  background-color: ${(props) => props.theme.colors.base.grey[1]};
  height: 100%;
  width: max-content;
  animation: ${(props) =>
    props.$isDrawerOpen
      ? css`
          ${fadeInShadow} 0.01s ease-in
        `
      : "none"};
  z-index: 10;
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
  padding: 8px 8px 0;
  display: flex;
  justify-content: center;
  align-self: flex-start;
`;

export const Brand = styled.div.attrs(() =>
  dataQaAttrs("layout-app-sider-brand"),
)<{
  $showLabel: boolean;
}>`
  padding: 8px;
  height: 48px;
  display: flex;
  align-items: center;
  column-gap: 12px;
  margin-bottom: 16px;
  border-radius: 8px;
  justify-content: flex-start;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid
      ${(props) => props.theme.colors.functional.border.selected};
    outline-offset: 2px;
  }
`;

export const BrandLogo = styled.img`
  display: block;
  width: 36px;
  height: 36px;
`;

export const BrandLogoText = styled.div`
  font-size: 20px;
  font-weight: 900;
`;
