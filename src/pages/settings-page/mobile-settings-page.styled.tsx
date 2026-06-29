import { Button, Flex, Typography } from "antd";
import styled from "styled-components";

export const Root = styled.div`
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

export const TitleRow = styled.div`
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 4px;
`;

export const IconBackButton = styled(Button)`
  && {
    flex: 0 0 auto;
    width: 44px;
    height: 44px;
    padding: 0;
    margin-inline-start: -8px;
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

export const HeaderCopy = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const PageTitle = styled(Typography.Title)`
  && {
    min-width: 0;
    margin: 0;
    flex: 1 1 auto;
    color: ${({ theme }) => theme.colors.functional.text.heading};
    font-size: ${({ theme }) => theme.fontSize.ultraLarge};
    line-height: 1.25;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const PageSubtitle = styled(Typography.Text)`
  && {
    display: block;
    color: ${({ theme }) => theme.colors.functional.text.subdued};
    font-size: ${({ theme }) => theme.fontSize.small};
    line-height: 1.35;
  }
`;

export const ContentSection = styled.div`
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

export const MobileFormDivider = styled.hr`
  margin: 20px 0;
  border: 0;
  border-top: 1px solid ${({ theme }) => theme.colors.functional.border.split};
`;

export const SectionGroup = styled.section`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const SectionTitle = styled(Typography.Text)`
  && {
    display: block;
    color: ${({ theme }) => theme.colors.functional.text.subdued};
    font-size: ${({ theme }) => theme.fontSize.small};
    font-weight: 600;
    line-height: 1.25;
    letter-spacing: 0;
  }
`;

export const PreferenceBlock = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const PreferenceLabel = styled.span`
  color: ${({ theme }) => theme.colors.functional.text.heading};
  font-size: ${({ theme }) => theme.fontSize.base};
  font-weight: 600;
  line-height: 1.35;
`;

export const FullWidthRadioGroup = styled.div`
  min-width: 0;

  .ant-radio-group {
    display: flex;
    width: 100%;
    min-width: 0;
  }

  .ant-radio-button-wrapper {
    flex: 1 1 0;
    min-width: 0;
    text-align: center;
  }
`;
