import styled from "styled-components";

export const ClientsMobilePageShell = styled.div`
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  & > * {
    flex: 1 1 auto;
    min-width: 0;
    min-height: 0;
  }
`;
