import { Radio, Typography } from "antd";
import styled from "styled-components";

export const OptionsRadioGroup = styled(Radio.Group)`
  width: 100%;
`;

export const OptionsList = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const OptionRow = styled.div<{ $disabled: boolean; $selected: boolean }>`
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  padding: 12px 16px;
  border: 1px solid
    ${({ $selected, theme }) =>
      $selected
        ? theme.colors.functional.border.selected
        : theme.colors.functional.border.cardBase};
  border-radius: ${({ theme }) => theme.radius.large};
  background: ${({ $selected, theme }) =>
    $selected
      ? theme.colors.functional.background.active
      : theme.colors.functional.background.elevated};
  box-shadow: ${({ $selected, theme }) =>
    $selected
      ? `0 0 0 1px ${theme.colors.functional.border.selected}`
      : "none"};
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  opacity: ${({ $disabled }) => ($disabled ? 0.65 : 1)};
  outline: none;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &:focus-visible {
    box-shadow: ${({ theme }) =>
      `0 0 0 2px ${theme.colors.functional.border.selected}`};
  }

  @media (hover: hover) {
    &:hover {
      border-color: ${({ $disabled, $selected, theme }) =>
        $disabled
          ? $selected
            ? theme.colors.functional.border.selected
            : theme.colors.functional.border.cardBase
          : theme.colors.functional.border.selected};
      background: ${({ $disabled, $selected, theme }) =>
        $disabled
          ? $selected
            ? theme.colors.functional.background.active
            : theme.colors.functional.background.elevated
          : $selected
            ? theme.colors.functional.background.active
            : theme.colors.functional.background.hover};
    }
  }
`;

export const OptionRadio = styled(Radio)`
  && {
    margin-top: 2px;
  }
`;

export const OptionContent = styled.div`
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const OptionIcon = styled.div<{ $selected: boolean }>`
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radius.large};
  background: ${({ $selected, theme }) =>
    $selected
      ? theme.colors.functional.background.primary
      : theme.colors.functional.background.natural};
  color: ${({ $selected, theme }) =>
    $selected
      ? theme.colors.semantic.primary
      : theme.colors.functional.text.subdued};
`;

export const OptionCopy = styled.div`
  min-width: 0;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const DesktopContent = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const DesktopHeader = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
`;

export const DesktopTitle = styled(Typography.Title)`
  && {
    margin: 0;
  }
`;
