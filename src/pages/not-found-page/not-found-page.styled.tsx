import styled from "styled-components";

import { dataQaAttrs } from "@/styled/data-qa-attrs";

import { NotFoundCatIllustration } from "./not-found-cat-illustration";

export const Root = styled.section.attrs(() =>
  dataQaAttrs("layout-not-found"),
)`
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  min-height: 0;
  min-width: 0;
  height: 100%;
  overflow: auto;
  padding: 32px 40px;
  background: ${({ theme }) => theme.colors.functional.background.elevated};

  @media (max-width: 767px) {
    padding: 24px 20px 32px;
    align-items: flex-start;
  }
`;

export const WaveTop = styled.svg.attrs(() =>
  dataQaAttrs("layout-not-found-wave-top"),
)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: clamp(72px, 14vh, 140px);
  pointer-events: none;
  color: ${({ theme }) => theme.colors.brandPalette[3]};
  opacity: 0.55;

  path {
    fill: currentColor;
  }
`;

export const WaveBottom = styled.svg.attrs(() =>
  dataQaAttrs("layout-not-found-wave-bottom"),
)`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: clamp(72px, 14vh, 140px);
  pointer-events: none;
  color: ${({ theme }) => theme.colors.brandPalette[3]};
  opacity: 0.55;

  path {
    fill: currentColor;
  }
`;

export const Stage = styled.div.attrs(() =>
  dataQaAttrs("layout-not-found-stage"),
)`
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  align-items: center;
  gap: clamp(24px, 4vw, 64px);
  width: min(960px, 100%);

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    justify-items: center;
    text-align: center;
  }
`;

export const Illustration = styled(NotFoundCatIllustration)`
  display: block;
  width: auto;
  max-width: min(100%, 320px);
  max-height: min(52vh, 420px);
  height: auto;
  margin-inline: auto;
  color: ${({ theme }) => theme.colors.brandPalette[5]};
  transform: rotateY(180deg);

  @media (max-width: 900px) {
    max-width: min(100%, 220px);
    max-height: min(36vh, 280px);
  }
`;

export const Copy = styled.div.attrs(() =>
  dataQaAttrs("layout-not-found-copy"),
)`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  max-width: 460px;

  @media (max-width: 900px) {
    align-items: center;
  }
`;

export const Code = styled.p`
  margin: 0;
  font-size: clamp(64px, 10vw, 96px);
  line-height: 0.95;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.brandPalette[6]};
`;

export const Title = styled.h1`
  margin: 0;
  font-size: clamp(18px, 2.2vw, 26px);
  line-height: 1.25;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  text-wrap: balance;
  color: ${({ theme }) => theme.colors.functional.text.heading};
`;

export const Description = styled.p`
  margin: 0;
  font-size: 15px;
  line-height: 1.55;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
`;

export const Actions = styled.div`
  margin-top: 8px;
`;
