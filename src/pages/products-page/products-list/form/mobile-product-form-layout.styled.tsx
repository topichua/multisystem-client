import { Button, Flex, Typography } from "antd";
import styled from "styled-components";

import { dataQaAttrs } from "@/styled/data-qa-attrs";

export const MobileRoot = styled.div.attrs(() =>
  dataQaAttrs("products-mobile-form-page"),
)`
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.functional.background.base};
`;

export const MobileScrollRegion = styled.div`
  box-sizing: border-box;
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  padding: 0 16px calc(32px + env(safe-area-inset-bottom, 0px));
`;

export const MobilePageHeader = styled.header`
  box-sizing: border-box;
  flex: 0 0 auto;
  min-width: 0;
  padding: 8px 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-bottom: 1px solid
    ${({ theme }) => theme.colors.functional.border.split};
  background: ${({ theme }) => theme.colors.functional.background.base};
`;

export const MobileBackButton = styled(Button)`
  && {
    align-self: flex-start;
    padding-inline: 0;
    height: auto;
    min-height: 44px;
    color: ${({ theme }) => theme.colors.functional.text.subdued};
  }

  &&:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.functional.border.selected};
    outline-offset: 2px;
  }
`;

export const MobilePageTitle = styled(Typography.Title)`
  && {
    min-width: 0;
    margin: 0;
    color: ${({ theme }) => theme.colors.functional.text.heading};
    font-size: ${({ theme }) => theme.fontSize.ultraLarge};
    line-height: 1.25;
  }
`;

export const MobileFormSections = styled(Flex)`
  && {
    width: 100%;
    min-width: 0;
    padding-top: 16px;
  }
`;

export const MobileFormActions = styled.div`
  width: 100%;
  min-width: 0;
  margin-top: 24px;
  padding-bottom: env(safe-area-inset-bottom, 0px);
`;
