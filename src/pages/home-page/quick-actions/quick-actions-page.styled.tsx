import { Card } from "antd";
import styled from "styled-components";

import { dataQaAttrs } from "@/styled/data-qa-attrs";

type AccentProps = {
  $accent: string;
  $accentBg: string;
};

export const DesktopQuickActionsViewport = styled.div`
  display: contents;

  @media (max-width: 767px) {
    display: none;
  }
`;

export const PageContainer = styled.div`
  position: relative;
  isolation: isolate;
  box-sizing: border-box;

  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  padding: 48px 32px;
  overflow: auto;

  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 12px;
  background-image: url("/background-images/quick_actions_background.png");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  box-shadow: ${({ theme }) => theme.shadow.xl};

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    background: ${({ theme }) => theme.colors.functional.background.base};
    opacity: 0.62;
  }

  > * {
    position: relative;
    z-index: 1;
  }
`;

export const DesktopContent = styled.div`
  width: 100%;
  max-width: 1120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 36px;
`;

export const PageHeader = styled.div`
  text-align: center;
`;

export const HeroIcon = styled.div<AccentProps>`
  width: 72px;
  height: 72px;
  margin: 0 auto 18px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  border-radius: 24px;
  color: ${({ $accent }) => $accent};
  background: ${({ $accentBg }) => $accentBg};
  border: 1px solid ${({ theme }) => theme.colors.functional.border.split};
  box-shadow: ${({ theme }) => theme.shadow.large};
  font-size: 32px;
`;

export const CardsGrid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
  gap: 20px;
`;

export const QuickActionCard = styled(Card)<AccentProps>`
  position: relative;
  overflow: hidden;
  height: 100%;
  min-height: 190px;
  border-radius: 18px;
  border: 1px solid ${({ theme }) => theme.colors.functional.border.cardBase};
  background: ${({ theme }) => theme.colors.functional.background.elevated};
  color: ${({ theme }) => theme.colors.functional.text.primary};
  box-shadow: ${({ theme }) => theme.shadow.cardShadow};

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  .ant-card-body {
    height: 100%;
    min-height: 190px;
    padding: 28px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
  }

  &::before {
    content: "";
    position: absolute;
    inset: 0 0 auto;
    height: 3px;
    background: ${({ $accent }) => $accent};
    opacity: 0.75;
  }

  &::after {
    content: "";
    position: absolute;
    top: -40px;
    left: 50%;
    width: 180px;
    height: 80px;
    transform: translateX(-50%);
    background: ${({ $accent }) => $accent};
    filter: blur(42px);
    opacity: 0.16;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadow.xl};
  }

  &:focus-visible {
    outline: 2px solid ${({ $accent }) => $accent};
    outline-offset: 3px;
  }
`;

export const CardIcon = styled.div<AccentProps>`
  width: 56px;
  height: 56px;
  border-radius: 18px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  color: ${({ $accent }) => $accent};
  background: ${({ $accentBg }) => $accentBg};
  border: 1px solid ${({ theme }) => theme.colors.functional.border.split};
  font-size: 26px;
`;

export const MobileWorkspace = styled.div.attrs(() =>
  dataQaAttrs("layout-mobile-workspace"),
)`
  display: none;

  @media (max-width: 767px) {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    padding: 16px 16px 32px;
    overflow-x: hidden;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 18px;
    background: ${({ theme }) => theme.colors.functional.background.base};
  }
`;

export const MobileHeader = styled.header`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const MobileTitleBlock = styled.div`
  min-width: 0;
`;

export const MobileTitle = styled.h1`
  margin: 0;
  color: ${({ theme }) => theme.colors.functional.text.heading};
  font-size: ${({ theme }) => theme.fontSize.ultraLarge};
  font-weight: 700;
  line-height: 1.25;
`;

export const MobileSubtitle = styled.p`
  margin: 6px 0 0;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  font-size: ${({ theme }) => theme.fontSize.medium};
  line-height: 1.35;
`;

export const MobileNavGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
`;

export const MobileNavCard = styled.button`
  appearance: none;
  position: relative;
  isolation: isolate;
  overflow: hidden;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  min-height: 112px;
  margin: 0;
  padding: 12px 8px;
  border: 1px solid ${({ theme }) => theme.colors.functional.border.cardBase};
  border-radius: ${({ theme }) => theme.radius.medium};
  background: ${({ theme }) => theme.colors.functional.background.elevated};
  color: ${({ theme }) => theme.colors.functional.text.primary};
  box-shadow: ${({ theme }) => theme.shadow.cardShadow};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-align: center;
  cursor: pointer;
  transition:
    background-color 0.16s ease,
    border-color 0.16s ease,
    box-shadow 0.16s ease,
    transform 0.12s ease;

  &::before {
    content: "";
    position: absolute;
    inset: 0 0 auto;
    z-index: 0;
    height: 3px;
    background: var(--card-accent);
    opacity: 0.84;
  }

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    background: linear-gradient(
      180deg,
      var(--card-surface-tint) 0%,
      ${({ theme }) => theme.colors.functional.background.elevated} 72%
    );
    opacity: 0.58;
  }

  > * {
    position: relative;
    z-index: 1;
  }

  &:hover,
  &:focus-visible {
    border-color: var(--card-accent);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px
      ${({ theme }) => theme.colors.functional.border.selected};
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      box-shadow: ${({ theme }) => theme.shadow.large};
      transform: translateY(-1px);
    }
  }

  &:active {
    transform: translateY(1px);

    &::after {
      opacity: 0.76;
    }
  }
`;

export const MobileNavIcon = styled.span`
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  border-radius: ${({ theme }) => theme.radius.medium};
  color: var(--card-accent);
  background: var(--card-accent-bg);
  box-shadow: inset 0 0 0 1px
    ${({ theme }) => theme.colors.functional.border.split};

  svg {
    width: 28px;
    height: 28px;
  }
`;

export const MobileNavLabel = styled.span`
  max-width: 100%;
  color: ${({ theme }) => theme.colors.functional.text.heading};
  font-size: ${({ theme }) => theme.fontSize.medium};
  font-weight: 600;
  line-height: 1.25;
  overflow-wrap: anywhere;
  word-break: normal;
  hyphens: auto;
`;
