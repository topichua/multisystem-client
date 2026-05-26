import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  body {
    background: ${({ theme }) => theme.colors.functional.background.base};
    color: ${({ theme }) => theme.colors.functional.text.primary};
    font-family: ${({ theme }) => theme.fontFamily};
  }
`;
