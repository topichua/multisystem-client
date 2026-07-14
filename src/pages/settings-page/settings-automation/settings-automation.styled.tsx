import styled from "styled-components";
import { Button, Typography } from "antd";

export const FormRoot = styled.div`
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  max-width: 960px;
  margin: 0 auto;
`;

export const HeaderTitle = styled(Typography.Title)`
  && {
    margin: 0;
  }
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 16px;
  flex-shrink: 0;
`;

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

export const ActiveLabel = styled.span`
  color: ${({ theme }) => theme.colors.functional.text.heading};
  font-size: ${({ theme }) => theme.fontSize.base};
  font-weight: 500;
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

export const TypeLabel = styled.span`
  color: ${({ theme }) => theme.colors.functional.text.heading};
  font-size: ${({ theme }) => theme.fontSize.base};
  font-weight: 500;
`;

export const SectionDivider = styled.hr`
  margin: 24px 0;
  border: 0;
  border-top: 1px solid ${({ theme }) => theme.colors.functional.border.split};
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

export const ConditionsStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
`;

export const ConditionBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const OrConnector = styled.div`
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  font-size: ${({ theme }) => theme.fontSize.small};
  font-weight: 500;
  padding-inline-start: 4px;
`;

export const ConditionRow = styled.div`
  display: grid;
  grid-template-columns: minmax(160px, 220px) auto minmax(160px, 1fr) 36px;
  gap: 12px;
  align-items: start;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

export const EqualsText = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  font-size: ${({ theme }) => theme.fontSize.base};
  white-space: nowrap;

  @media (max-width: 720px) {
    min-height: auto;
  }
`;

export const AtBranchExtensionCta = styled.button`
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  max-width: 100%;
  margin-top: 4px;
  padding: 10px 14px;
  border: 1px dashed ${({ theme }) => theme.colors.functional.border.selected};
  border-radius: ${({ theme }) => theme.radius.semiLarge};
  background: ${({ theme }) => theme.colors.functional.background.primary};
  color: ${({ theme }) => theme.colors.semantic.primary};
  font-size: ${({ theme }) => theme.fontSize.small};
  font-weight: 500;
  line-height: 1.35;
  text-align: left;
  cursor: pointer;
`;

export const AtBranchExtensionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  font-size: ${({ theme }) => theme.fontSize.base};
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

export const AtBranchMoreThanLabel = styled.span`
  color: ${({ theme }) => theme.colors.functional.text.heading};
  flex-shrink: 0;
`;

export const AtBranchDaysLabel = styled.span`
  color: ${({ theme }) => theme.colors.functional.text.heading};
  flex-shrink: 0;
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

export const AddConditionButton = styled(Button)`
  && {
    align-self: flex-start;
    padding-inline: 0;
    height: auto;
  }
`;

export const RemoveConditionButton = styled.button`
  width: 32px;
  height: 32px;
  border: 0;
  background: transparent;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.functional.text.subdued};

  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }
`;

export const ListItem = styled.button`
  box-sizing: border-box;
  width: 100%;
  margin: 0;
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colors.functional.border.cardBase};
  border-radius: ${({ theme }) => theme.radius.semiLarge};
  background: ${({ theme }) => theme.colors.functional.background.elevated};
  text-align: left;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: border-color 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.functional.border.selected};
  }
`;

export const ListItemHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

export const ListItemTitle = styled.div`
  min-width: 0;
  color: ${({ theme }) => theme.colors.functional.text.heading};
  font-size: ${({ theme }) => theme.fontSize.large};
  font-weight: 600;
  line-height: 1.3;
`;

export const ListItemSummary = styled.div`
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  font-size: ${({ theme }) => theme.fontSize.small};
  line-height: 1.45;
`;

export const ListStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
