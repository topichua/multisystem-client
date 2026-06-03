import styled from "styled-components";

export const PaneScrollRegion = styled.div`
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow: auto;
`;

export const PaneSectionTitle = styled.h2`
  margin: 0;
  font-size: ${(p) => p.theme.fontSize.extraLarge};
  font-weight: 600;
  line-height: 1.3;
  color: ${(p) => p.theme.colors.functional.text.heading};
`;

export const PaneSectionHint = styled.p`
  margin: 6px 0 0;
  font-size: ${(p) => p.theme.fontSize.small};
  color: ${(p) => p.theme.colors.functional.text.subdued};
  line-height: 1.35;
`;

export const PaneSectionHeader = styled.div`
  flex-shrink: 0;
  padding: 12px;
`;

export const PaneSectionHeaderStack = styled(PaneSectionHeader)`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
