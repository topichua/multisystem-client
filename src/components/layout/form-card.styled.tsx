import styled from "styled-components";

export const FormCard = styled.div`
  box-sizing: border-box;
  max-width: 960px;
  padding: 24px;
  border: 1px solid ${({ theme }) => theme.colors.functional.border.cardBase};
  border-radius: ${({ theme }) => theme.radius.semiLarge};
  background: ${({ theme }) => theme.colors.functional.background.elevated};
  margin: 0 auto;
`;

export const FormDivider = styled.hr`
  margin: 24px 0;
  border: 0;
  border-top: 1px solid ${({ theme }) => theme.colors.functional.border.split};
`;

export const SettingSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const SettingLabel = styled.span`
  color: ${({ theme }) => theme.colors.functional.text.heading};
  font-size: ${({ theme }) => theme.fontSize.base};
  font-weight: 600;
  line-height: 1.35;
`;
