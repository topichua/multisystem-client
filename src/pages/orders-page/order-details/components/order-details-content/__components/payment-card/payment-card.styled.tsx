import styled from "styled-components";

export const SummaryBox = styled.div`
  padding: 12px 14px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.functional.background.base};
`;

export const SummaryDivider = styled.div`
  margin: 10px 0;
  border-top: 1px dashed
    ${({ theme }) => theme.colors.functional.border.cardBase};
`;

export const MethodList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const MethodButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 44px;
  padding: 10px 12px;
  border: 1px solid ${(props) => props.theme.colors.functional.border.cardBase};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.functional.background.base};
  color: ${({ theme }) => theme.colors.functional.text.heading};
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.functional.background.natural};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.functional.border.selected};
    outline-offset: 2px;
  }
`;

export const MethodIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
`;

export const MethodLabel = styled.span`
  font-size: 14px;
  line-height: 1.35;
  color: ${({ theme }) => theme.colors.functional.text.heading};
`;

export const CancelButton = styled.button`
  align-self: center;
  padding: 4px 8px;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  font-size: 14px;
  line-height: 1.35;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.functional.text.heading};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.functional.border.selected};
    outline-offset: 2px;
    border-radius: 4px;
  }
`;

export const PaymentsSectionTitle = styled.div`
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
`;

export const PaymentTransactionItem = styled.div`
  padding-top: 2px;
  padding-bottom: 12px;
  border-bottom: 1px solid
    ${({ theme }) => theme.colors.functional.border.cardBase};
`;

export const PaymentAmountDot = styled.span<{
  $tone?: "credit" | "debit" | "pending";
}>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ theme, $tone }) => {
    if ($tone === "debit") {
      return theme.colors.base.red[5];
    }

    if ($tone === "credit") {
      return theme.colors.base.green[5];
    }

    return theme.colors.functional.border.selected;
  }};
  flex-shrink: 0;
`;

export const TransferMethodBox = styled.div`
  padding: 12px 14px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.functional.background.base};
`;
