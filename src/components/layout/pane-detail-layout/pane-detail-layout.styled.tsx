import styled from "styled-components";

export const Root = styled.div<{ $inset?: boolean }>`
  box-sizing: border-box;
  flex: 1;
  min-height: 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
`;

export const HeaderSlot = styled.div`
  flex-shrink: 0;
  padding-bottom: 16px;
  border-bottom: 1px solid
    ${({ theme }) => theme.colors.functional.border.split};
  padding: 12px 24px;
  background: ${({ theme }) => theme.colors.functional.background.elevated};

  h2,
  h3,
  h4,
  h5,
  h6 {
    font-size: ${({ theme }) => theme.fontSize.ultraLarge};
  }
`;

export const BodySlot = styled.div`
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow: auto;
  padding-top: 16px;
  padding: 12px 24px;
  background: ${({ theme }) => theme.colors.functional.background.base};
`;
