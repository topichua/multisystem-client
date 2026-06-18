import { Avatar as AntdAvatar } from "antd";
import styled from "styled-components";

export const TableSection = styled.div`
  width: 100%;
  max-width: 1160px;
  margin: 0 auto;
`;

export const MemberAvatar = styled(AntdAvatar)`
  && {
    flex: 0 0 auto;
    background: ${({ theme }) => theme.colors.brandPalette[6]};
    color: ${({ theme }) => theme.colors.base.white};
    font-size: 13px;
    font-weight: 700;
  }
`;

export const MemberIdentity = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`;

export const MemberText = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const MemberNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

export const MemberName = styled.span`
  color: ${({ theme }) => theme.colors.functional.text.heading};
  font-size: ${({ theme }) => theme.fontSize.base};
  font-weight: 600;
  line-height: 1.35;
`;

export const MemberEmail = styled.span`
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  font-size: ${({ theme }) => theme.fontSize.small};
  line-height: 1.35;
`;

export const YouTag = styled.span`
  flex: 0 0 auto;
  padding: 2px 8px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.functional.background.primary};
  color: ${({ theme }) => theme.colors.semantic.primary};
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1.3;
  text-transform: uppercase;
`;
