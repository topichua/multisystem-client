import styled from "styled-components";

export const ModalBody = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 0.95fr);
  height: min(640px, calc(100dvh - 220px));
  min-height: min(540px, calc(100dvh - 220px));
  border-top: 1px solid ${({ theme }) => theme.colors.functional.border.split};
  overflow: hidden;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
    height: auto;
    min-height: 0;
    max-height: calc(100dvh - 220px);
    overflow-y: auto;
  }
`;

export const SupplyColumn = styled.section`
  display: flex;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  gap: 14px;
  padding: 18px 24px;
  overflow: auto;
`;

export const VariantsColumn = styled.section`
  display: flex;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  gap: 8px;
  padding: 18px 24px;
  border-left: 1px solid ${({ theme }) => theme.colors.functional.border.split};
  overflow: hidden;

  @media (max-width: 820px) {
    border-top: 1px solid ${({ theme }) => theme.colors.functional.border.split};
    border-left: 0;
    overflow: visible;
  }
`;

export const CountPill = styled.span`
  display: inline-flex;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.functional.background.active};
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  font-size: ${({ theme }) => theme.fontSize.small};
  line-height: 1;
`;

export const SelectedHeader = styled.div`
  display: grid;
  grid-template-columns:
    minmax(160px, 1.6fr) 80px minmax(92px, 0.75fr) minmax(116px, 0.9fr)
    28px;
  gap: 10px;
  padding: 0 4px 10px;
  border-bottom: 1px solid
    ${({ theme }) => theme.colors.functional.border.split};
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  font-size: ${({ theme }) => theme.fontSize.small};
  font-weight: 600;
  text-transform: uppercase;

  @media (max-width: 620px) {
    display: none;
  }
`;

export const SelectedLinesList = styled.div`
  min-height: 70px;
  flex: 1 1 auto;
`;

export const SelectedLineRow = styled.div`
  display: grid;
  grid-template-columns:
    minmax(160px, 1.6fr) 80px minmax(92px, 0.75fr) minmax(116px, 0.9fr)
    28px;
  gap: 10px;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px dashed
    ${({ theme }) => theme.colors.functional.border.split};

  @media (max-width: 620px) {
    grid-template-columns: 1fr 1fr;
  }
`;

export const VariantsList = styled.div`
  min-height: 0;
  flex: 1 1 auto;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding-right: 4px;
`;
