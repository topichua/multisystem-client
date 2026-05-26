import { Card } from "antd";
import styled from "styled-components";

import { dataQaAttrs } from "@/styled/data-qa-attrs";

export const Page = styled.main.attrs(() => dataQaAttrs("layout-login"))`
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  @media (max-width: 767px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

export const FormSide = styled.section.attrs(() =>
  dataQaAttrs("layout-login-form-side"),
)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;

  @media (max-width: 767px) {
    position: relative;
    overflow: hidden;

    width: 100%;
    min-height: 100vh;
    padding: 24px;
    background: ${(props) => props.theme.colors.functional.background.elevated};

    &::before {
      content: "";
      position: absolute;
      inset: 0;
      background-image: url("/background-images/login-cover_mobile.jpg");
      background-size: cover;
      background-position: center;
      opacity: 0.3;
      z-index: 0;
      pointer-events: none;
    }

    > * {
      position: relative;
      z-index: 1;
    }
  }
`;

export const LoginCard = styled(Card).attrs(() =>
  dataQaAttrs("layout-login-card"),
)`
  width: 100%;
  max-width: 420px;
  border: none;
  box-shadow: none;
  background: transparent;

  .ant-card-body {
    padding: 0;
  }
`;

export const ImageSide = styled.section.attrs(() =>
  dataQaAttrs("layout-login-image-side"),
)`
  min-height: 100vh;
  background-image: url("/background-images/login-cover.jpg");
  background-size: cover;
  background-position: center;

  @media (max-width: 767px) {
    display: none;
  }
`;

export const Header = styled.div.attrs(() =>
  dataQaAttrs("layout-login-header"),
)`
  margin-bottom: 32px;
`;

export const Brand = styled.div`
  display: flex;
  align-items: center;

  @media (max-width: 767px) {
    justify-content: center;
  }
`;

export const Logo = styled.img`
  display: block;
  height: 32px;
  width: auto;
`;

export const FormActions = styled.div`
  margin-top: 24px;
`;

export const PageTitle = styled.h1`
  margin-bottom: 8px;
  font-size: 32px;
  line-height: 1.2;
`;

export const PageDescription = styled.p`
  color: ${(props) => props.theme.colors.functional.text.subdued};
`;
