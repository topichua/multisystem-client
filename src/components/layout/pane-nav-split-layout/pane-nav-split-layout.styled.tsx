import styled from "styled-components";

export const Root = styled.div<{ customWidth?: number }>`
  box-sizing: border-box;
  flex: 1;
  min-height: 0;
  min-width: 0;
  display: grid;
  grid-template-columns: ${(props) => props.customWidth}px minmax(0, 1fr);
  overflow: hidden;

  @media (max-width: 767px) {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto minmax(0, 1fr);
  }
`;

export const SubSidebar = styled.aside`
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 16px 8px;
  border-right: 1px solid
    ${(props) => props.theme.colors.functional.border.cardBase};

  @media (max-width: 767px) {
    border-right: none;
    border-bottom: 1px solid
      ${(props) => props.theme.colors.functional.border.cardBase};
    padding-top: 8px;
    max-height: min(45vh, 320px);
  }
`;

export const SubMain = styled.div`
  box-sizing: border-box;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 0;
  background: ${(props) => props.theme.colors.functional.background.base};

  @media (max-width: 767px) {
    padding-left: 0;
    padding-top: 16px;
  }
`;
