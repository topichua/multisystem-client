import { Card } from "antd";
import styled from "styled-components";

type AccentProps = {
  $accent: string;
  $accentBg: string;
};

export const PageContainer = styled.div`
  position: relative;
  isolation: isolate;
  box-sizing: border-box;

  height: 100%;
  min-height: 0;
  margin: 0 auto;
  padding: 64px 32px 0;
  overflow-x: hidden;
  overflow-y: auto;

  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 12px;
  background-image: url("/background-images/quick_actions_background.png");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  box-shadow: 0px 24px 48px -12px rgba(0, 22, 54, 0.14);

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

  @media (max-width: 768px) {
    padding: 40px 20px;
  }
`;

export const PageHeader = styled.div`
  text-align: center;
`;

export const HeroIcon = styled.div`
  width: 72px;
  height: 72px;
  margin: 0 auto 18px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  border-radius: 24px;
  color: #722ed1;
  background: rgba(114, 46, 209, 0.1);
  border: 1px solid ${({ theme }) => theme.colors.functional.border.split};
  box-shadow: 0 16px 36px rgba(114, 46, 209, 0.16);
  font-size: 32px;
`;

const CARD_MIN_WIDTH = "280px";
const CARD_GAP = "20px";

export const CardsGrid = styled.div`
  width: min(100%, 1040px);
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: ${CARD_GAP};

  > * {
    flex: 1 1 ${CARD_MIN_WIDTH};
    max-width: 100%;
    min-width: 0;
  }

  @media (min-width: 993px) {
    > * {
      max-width: calc((100% - 2 * ${CARD_GAP}) / 3);
    }
  }

  @media (max-width: 992px) and (min-width: 577px) {
    > * {
      max-width: calc((100% - ${CARD_GAP}) / 2);
    }
  }
`;

export const QuickActionCard = styled(Card)<AccentProps>`
  position: relative;
  overflow: hidden;

  min-height: 190px;
  border-radius: 18px;
  border: 1px solid ${({ theme }) => theme.colors.functional.border.cardBase};
  background: ${({ theme }) => theme.colors.functional.background.elevated};
  color: ${({ theme }) => theme.colors.functional.text.primary};
  box-shadow: 0 18px 44px rgba(0, 22, 54, 0.08);

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  .ant-card-body {
    height: 100%;
    padding: 32px 28px;
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
    box-shadow: 0 24px 56px rgba(0, 22, 54, 0.12);
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
