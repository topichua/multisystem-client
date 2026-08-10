import styled from "styled-components";

export const AnalyticsProBadge = styled.span`
  flex-shrink: 0;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: ${({ theme }) => theme.fontSize.small};
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.semantic.primary};
  background: ${({ theme }) => theme.colors.functional.background.active};
`;
