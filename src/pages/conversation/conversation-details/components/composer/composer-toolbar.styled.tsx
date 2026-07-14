import styled, { css, keyframes } from "styled-components";

import { dataQaAttrs } from "@/styled/data-qa-attrs";

export const Toolbar = styled.div.attrs(() =>
  dataQaAttrs("layout-conversation-details-composer-toolbar"),
)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
  min-width: 0;
`;

export const Tabs = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 0 0 auto;
  min-width: 0;
`;

export const Actions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex: 1 1 auto;
  min-width: 0;

  @media (max-width: 560px) {
    width: 100%;
    flex-basis: 100%;
    flex-wrap: wrap;
    justify-content: stretch;

    .ant-btn {
      flex: 1 1 auto;
    }
  }
`;

export const LastOrderButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  max-width: 340px;
  height: 32px;
  padding: 0 10px;
  border: 1px solid ${({ theme }) => theme.colors.functional.border.cardBase};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.functional.background.elevated};
  color: ${({ theme }) => theme.colors.functional.text.primary};
  font: inherit;
  font-size: 12px;
  line-height: 1;
  cursor: pointer;
  transition:
    border-color 0.16s ease,
    background 0.16s ease,
    color 0.16s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.functional.border.selected};
    background: ${({ theme }) => theme.colors.functional.background.hover};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.functional.border.selected};
    outline-offset: 2px;
  }

  svg {
    flex: 0 0 auto;
    color: ${({ theme }) => theme.colors.functional.text.subdued};
  }

  @media (max-width: 560px) {
    flex: 1 1 100%;
    max-width: none;
    justify-content: flex-start;
  }
`;

export const LastOrderLabel = styled.span`
  flex: 0 0 auto;
  color: ${({ theme }) => theme.colors.functional.text.disabled};
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1;
  text-transform: uppercase;
`;

export const LastOrderNumber = styled.span`
  flex: 0 0 auto;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.functional.text.heading};
  white-space: nowrap;
`;

export const LastOrderStatus = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  font-weight: 500;
`;

export const LastOrderStatusDot = styled.span<{ $statusColor: string }>`
  flex: 0 0 auto;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: ${({ $statusColor }) =>
    $statusColor ? $statusColor : '#4ebe7d'};
`;

export const LastOrderStatusName = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const LastOrderTotal = styled.span`
  flex: 0 0 auto;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  white-space: nowrap;
`;

const lastOrderSkeletonPulse = keyframes`
  0% {
    opacity: 0.55;
  }

  50% {
    opacity: 1;
  }

  100% {
    opacity: 0.55;
  }
`;

export const LastOrderSkeleton = styled.span`
  display: inline-flex;
  flex: 0 1 280px;
  max-width: 280px;
  height: 32px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.functional.background.natural};
  box-shadow: inset 0 0 0 1px
    ${({ theme }) => theme.colors.functional.border.cardBase};
  animation: ${lastOrderSkeletonPulse} 1.2s ease-in-out infinite;

  @media (max-width: 560px) {
    flex: 1 1 100%;
    max-width: none;
  }
`;

const tabBase = css`
  position: relative;
  padding: 0 0 8px;
  border: 0;
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.3;
  white-space: nowrap;
`;

export const Tab = styled.button<{ $active?: boolean; $disabled?: boolean }>`
  ${tabBase}
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  color: ${({ $active, $disabled, theme }) => {
    if ($disabled) {
      return theme.colors.functional.text.subdued;
    }

    if ($active) {
      return theme.colors.semantic.primary;
    }

    return theme.colors.functional.text.primary;
  }};
  opacity: ${({ $disabled }) => ($disabled ? 0.45 : 1)};

  &::after {
    content: "";
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    height: 2px;
    border-radius: 2px;
    background: ${({ $active, theme }) =>
      $active ? theme.colors.semantic.primary : "transparent"};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.functional.border.selected};
    outline-offset: 2px;
  }
`;
