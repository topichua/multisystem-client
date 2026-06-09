import styled from "styled-components";

export const IntegrationsStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 860px;
  margin: 50px auto;
`;

export const IntegrationCard = styled.div`
  box-sizing: border-box;
  padding: 20px 24px;
  border: 1px solid ${({ theme }) => theme.colors.functional.border.cardBase};
  border-radius: ${({ theme }) => theme.radius.semiLarge};
  background: ${({ theme }) => theme.colors.functional.background.elevated};
`;

export const IntegrationCardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
`;

export const IntegrationCardIdentity = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  min-width: 0;
`;

export const IntegrationCardIcon = styled.span`
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  width: 40px;
  height: 40px;
  font-size: 32px;
  line-height: 1;
  svg {
    display: block;
  }
`;

export const IntegrationCardText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

export const IntegrationCardTitle = styled.span`
  font-size: ${({ theme }) => theme.fontSize.large};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.functional.text.heading};
  line-height: 1.3;
`;

export const IntegrationCardDescription = styled.span`
  font-size: ${({ theme }) => theme.fontSize.small};
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  line-height: 1.35;
`;

export const IntegrationCardDivider = styled.hr`
  margin: 20px 0 0;
  border: 0;
  border-top: 1px solid ${({ theme }) => theme.colors.functional.border.split};
`;

export const IntegrationAccountsList = styled.div`
  display: flex;
  flex-direction: column;
`;

export const IntegrationEmptyState = styled.p`
  margin: 16px 0 0;
  font-size: ${({ theme }) => theme.fontSize.small};
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  line-height: 1.35;
`;

export const IntegrationAccountRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 0;

  & + & {
    border-top: 1px solid ${({ theme }) => theme.colors.functional.border.split};
  }
`;

export const IntegrationAccountInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

export const IntegrationAccountName = styled.span`
  font-size: ${({ theme }) => theme.fontSize.base};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.functional.text.heading};
  line-height: 1.35;
`;

export const IntegrationConnectedStatus = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: ${({ theme }) => theme.fontSize.small};
  color: ${({ theme }) => theme.colors.semantic.success};
  line-height: 1.35;

  &::before {
    content: "";
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    flex-shrink: 0;
  }
`;
