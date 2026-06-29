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

export const IntegrationConnectedStatus = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: ${({ theme }) => theme.colors.semantic.success};

  &::before {
    content: "";
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    flex-shrink: 0;
  }
`;

export const NovaPoshtaWizard = styled.div`
  margin-top: 20px;
`;

export const NovaPoshtaWizardSteps = styled.div`
  margin-bottom: 24px;

  .ant-steps-item-icon {
    border: 0;
  }

  .ant-steps-item-finish {
    .ant-steps-item-icon {
      background: ${({ theme }) => theme.colors.semantic.success};
    }

    .ant-steps-item-title {
      color: ${({ theme }) => theme.colors.semantic.success};
    }

    .ant-steps-icon {
      color: ${({ theme }) => theme.colors.functional.text.inverted};

      svg {
        color: ${({ theme }) => theme.colors.functional.text.inverted};
      }
    }
  }

  .ant-steps-item-process {
    .ant-steps-item-icon {
      background: ${({ theme }) => theme.colors.semantic.primary};
    }

    .ant-steps-icon {
      color: ${({ theme }) => theme.colors.functional.text.inverted};
    }
  }

  .ant-steps-item-wait {
    .ant-steps-item-icon {
      background: ${({ theme }) => theme.colors.functional.background.natural};
    }

    .ant-steps-icon,
    .ant-steps-item-title {
      color: ${({ theme }) => theme.colors.functional.text.subdued};
    }
  }

  .ant-steps-item-title {
    font-weight: 600;
  }
`;

export const NovaPoshtaWizardStepNote = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-top: 16px;
  font-size: ${({ theme }) => theme.fontSize.small};
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  line-height: 1.4;

  svg {
    flex: 0 0 auto;
    margin-top: 2px;
    color: currentColor;
  }
`;

export const NovaPoshtaWizardHint = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-top: -8px;
  font-size: ${({ theme }) => theme.fontSize.small};

  svg {
    flex: 0 0 auto;
    margin-top: 2px;
    color: ${({ theme }) => theme.colors.functional.text.subdued};
  }
`;

export const NovaPoshtaWizardFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 24px;

  @media (max-width: 575px) {
    flex-direction: column-reverse;

    .ant-btn {
      width: 100%;
    }
  }
`;

export const NovaPoshtaAddressGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(92px, 120px) minmax(92px, 120px);
  gap: 12px;

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
`;

export const MobileIntegrationsStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  min-width: 0;
`;

export const MobileIntegrationCardHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
`;

export const MobileConnectedCount = styled.span`
  font-size: ${({ theme }) => theme.fontSize.small};
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  line-height: 1.35;
`;

export const MobileIntegrationAccountCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  padding: 16px 0;

  & + & {
    border-top: 1px solid ${({ theme }) => theme.colors.functional.border.split};
  }
`;

export const MobileIntegrationAccountMeta = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 0;
`;

export const MobileIntegrationAccountDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  flex: 1 1 auto;
`;

export const MobileIntegrationAccountStatusRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 16px;
`;
