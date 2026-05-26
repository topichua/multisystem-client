import styled, { css } from "styled-components";

export const Root = styled.div<{ $inset?: boolean }>`
  box-sizing: border-box;
  flex: 1;
  min-height: 0;
  min-width: 0;
  display: flex;
  flex-direction: column;

  ${(props) =>
    props.$inset &&
    css`
      padding: 12px 24px;
    `}
`;

export const HeaderSlot = styled.div`
  flex-shrink: 0;
  padding-bottom: 16px;
  border-bottom: 1px solid
    ${({ theme }) => theme.colors.functional.border.split};
`;

export const BodySlot = styled.div`
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow: auto;
  padding-top: 16px;
`;
