import styled, { css } from "styled-components";

export const WishlistBadge = styled.span<{
  $compact?: boolean;
  $interactive?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  gap: ${({ $compact }) => ($compact ? "3px" : "4px")};
  flex-shrink: 0;
  min-height: ${({ $compact }) => ($compact ? "22px" : "24px")};
  padding: ${({ $compact }) => ($compact ? "1px 6px" : "2px 8px")};
  border: none;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.functional.background.error};
  color: ${({ theme }) => theme.colors.base.red[7]};
  font: inherit;
  font-size: ${({ $compact }) => ($compact ? "12px" : "13px")};
  font-weight: 600;
  line-height: 1.2;

  ${({ $interactive }) =>
    $interactive &&
    css`
      cursor: pointer;

      &:hover {
        filter: brightness(0.97);
      }

      &:focus-visible {
        outline: 2px solid ${({ theme }) => theme.colors.base.red[5]};
        outline-offset: 2px;
      }
    `}
`;
