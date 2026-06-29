import { Button, Flex, Typography } from "antd";
import styled from "styled-components";

import { dataQaAttrs } from "@/styled/data-qa-attrs";

export const Root = styled.div.attrs(() =>
  dataQaAttrs("settings-mobile-group-editor"),
)`
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.functional.background.base};
`;

export const ScrollRegion = styled.div`
  box-sizing: border-box;
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 0 16px calc(32px + env(safe-area-inset-bottom, 0px));
`;

export const PageHeader = styled.header`
  box-sizing: border-box;
  flex: 0 0 auto;
  min-width: 0;
  padding: 8px 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-bottom: 1px solid
    ${({ theme }) => theme.colors.functional.border.split};
  background: ${({ theme }) => theme.colors.functional.background.base};
`;

export const HeaderRow = styled(Flex)`
  && {
    width: 100%;
    min-width: 0;
  }
`;

export const BackButton = styled(Button)`
  && {
    align-self: flex-start;
    padding-inline: 0;
    height: auto;
    min-height: 44px;
  }
`;

export const PageTitle = styled(Typography.Title)`
  && {
    min-width: 0;
    margin: 0;
    flex: 1 1 auto;
    color: ${({ theme }) => theme.colors.functional.text.heading};
    font-size: ${({ theme }) => theme.fontSize.large};
    line-height: 1.25;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const FormSection = styled.div`
  min-width: 0;
  padding-top: 16px;
`;

export const FooterActions = styled(Flex)`
  && {
    width: 100%;
    min-width: 0;
    padding-top: 24px;
  }
`;

export const StateContainer = styled.div`
  box-sizing: border-box;
  padding: 16px;
`;
