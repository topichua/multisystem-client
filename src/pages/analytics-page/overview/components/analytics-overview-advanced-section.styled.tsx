import styled from "styled-components";

import { dataQaAttrs } from "@/styled/data-qa-attrs";

export const Section = styled.section.attrs(() =>
  dataQaAttrs("layout-analytics-overview-advanced-section"),
)`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  min-width: 0;
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export const SectionTitle = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  font-size: ${({ theme }) => theme.fontSize.small};
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;

export const SectionBadge = styled.span`
  flex-shrink: 0;
  padding: 4px 10px;
  border-radius: 999px;
  color: ${({ theme }) => theme.colors.semantic.primary};
  background: ${({ theme }) => theme.colors.functional.background.active};
  font-size: ${({ theme }) => theme.fontSize.small};
  font-weight: 500;
  line-height: 1.2;
  white-space: nowrap;
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 700px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const CardLink = styled.a`
  box-sizing: border-box;
  min-width: 0;
  min-height: 88px;
  padding: 16px;
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.colors.functional.border.cardBase};
  border-radius: ${({ theme }) => theme.radius.large};
  background: ${({ theme }) => theme.colors.functional.background.elevated};
  color: inherit;
  text-decoration: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      border-color: ${({ theme }) => theme.colors.semantic.primary};
      box-shadow: ${({ theme }) => theme.shadow.cardShadow};
    }
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.functional.border.selected};
    outline-offset: 2px;
  }
`;

export const IconTile = styled.span<{ $accent: string; $accentBg: string }>`
  width: 48px;
  height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: ${({ theme }) => theme.radius.medium};
  color: ${({ $accent }) => $accent};
  background: ${({ $accentBg }) => $accentBg};

  svg {
    width: 24px;
    height: 24px;
  }
`;

export const Copy = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

export const Title = styled.span`
  min-width: 0;
  color: ${({ theme }) => theme.colors.functional.text.heading};
  font-size: ${({ theme }) => theme.fontSize.medium};
  font-weight: 600;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ProBadge = styled.span`
  flex-shrink: 0;
  padding: 2px 8px;
  border-radius: 999px;
  color: ${({ theme }) => theme.colors.semantic.primary};
  background: ${({ theme }) => theme.colors.functional.background.active};
  font-size: ${({ theme }) => theme.fontSize.small};
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: 0.02em;
  text-transform: uppercase;
`;

export const Description = styled.span`
  display: block;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  font-size: ${({ theme }) => theme.fontSize.small};
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const DetailsLink = styled.span`
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: ${({ theme }) => theme.colors.semantic.primary};
  font-size: ${({ theme }) => theme.fontSize.small};
  font-weight: 500;
  line-height: 1.3;
  white-space: nowrap;
  opacity: 0;
  transform: translateX(6px);
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;

  svg {
    width: 14px;
    height: 14px;
  }

  ${CardLink}:hover &,
  ${CardLink}:focus-visible & {
    opacity: 1;
    transform: translateX(0);
  }

  @media (hover: none) {
    opacity: 1;
    transform: none;
  }
`;
