import styled from "styled-components";

export const MobileEditorActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;

  @media (max-width: 420px) {
    align-items: stretch;
    flex-direction: column;

    .ant-btn {
      width: 100%;
    }
  }
`;

export const ListContentRoot = styled.div`
  box-sizing: border-box;
  width: 100%;
  max-width: 960px;
  margin: 24px auto;
  min-width: 0;
`;

export const ListIntroRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  min-width: 0;

  .ant-btn {
    flex: 0 0 auto;
  }

  @media (max-width: 720px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
`;

export const TypeRow = styled.div`
  display: grid;
  grid-template-columns: minmax(140px, 200px) minmax(0, 1fr);
  gap: 16px;
  align-items: center;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`;

export const LogicBadge = styled.span<{ $tone: "if" | "then" }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  padding: 2px 12px;
  border-radius: 999px;
  font-size: ${({ theme }) => theme.fontSize.small};
  font-weight: 600;
  line-height: 1.2;
  color: ${({ theme, $tone }) =>
    $tone === "if" ? theme.colors.base.yellow[8] : theme.colors.base.green[8]};
  background: ${({ theme, $tone }) =>
    $tone === "if" ? theme.colors.base.yellow[2] : theme.colors.base.green[2]};
`;

export const ConditionRow = styled.div`
  display: grid;
  grid-template-columns:
    minmax(150px, 1fr) minmax(150px, 200px) minmax(160px, 1.2fr)
    36px;
  gap: 12px;
  align-items: start;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

export const AtBranchExtensionPrefix = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  flex-shrink: 0;

  &::after {
    content: "";
    width: 1px;
    height: 18px;
    background: ${({ theme }) => theme.colors.functional.border.selected};
  }
`;

export const ThenActionLabel = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  color: ${({ theme }) => theme.colors.functional.text.heading};
  font-size: ${({ theme }) => theme.fontSize.base};
  font-weight: 500;
  border: 1px solid ${({ theme }) => theme.colors.functional.border.outline};
  border-radius: ${({ theme }) => theme.radius.large};
  padding: 4px 8px;
`;

export const ActionRow = styled.div`
  display: grid;
  grid-template-columns: minmax(200px, 1fr) minmax(180px, 1fr);
  gap: 12px;
  margin-top: 16px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;
