import { Button, Typography } from "antd";
import styled from "styled-components";

export const Root = styled.div`
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

export const Header = styled.header`
  box-sizing: border-box;
  flex: 0 0 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 16px 10px;
  border-bottom: 1px solid
    ${({ theme }) => theme.colors.functional.border.split};
  background: ${({ theme }) => theme.colors.functional.background.base};
`;

export const HeaderTopRow = styled.div`
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const BackButton = styled(Button)`
  && {
    flex: 0 0 auto;
    width: 44px;
    height: 44px;
    padding: 0;
    margin-inline-start: -8px;
    color: ${({ theme }) => theme.colors.functional.text.subdued};
  }

  &&:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.functional.border.selected};
    outline-offset: 2px;
  }
`;

export const PageTitle = styled(Typography.Title)`
  && {
    min-width: 0;
    margin: 0;
    color: ${({ theme }) => theme.colors.functional.text.heading};
    font-size: ${({ theme }) => theme.fontSize.ultraLarge};
    line-height: 1.25;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const Content = styled.main`
  box-sizing: border-box;
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const ProfilePanel = styled.div`
  flex: 0 0 auto;
  min-width: 0;
  padding: 12px 16px;
  border-bottom: 1px solid
    ${({ theme }) => theme.colors.functional.border.split};
  background: ${({ theme }) => theme.colors.functional.background.elevated};
`;

export const MediaPanel = styled.div`
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
`;

export const DetailPanel = styled.div`
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
`;
