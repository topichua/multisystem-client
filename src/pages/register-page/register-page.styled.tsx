import { Card } from "antd";
import styled from "styled-components";

import { authFormInputStyles } from "@/pages/auth-shared/auth-form-controls.styles";
import { dataQaAttrs } from "@/styled/data-qa-attrs";

export const Page = styled.main.attrs(() => dataQaAttrs("layout-register"))`
  min-height: 100vh;
  min-height: 100dvh;
  display: grid;
  grid-template-columns: 1fr 1fr;

  @media (max-width: 767px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

export const FormSide = styled.section.attrs(() =>
  dataQaAttrs("layout-register-form-side"),
)`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;

  @media (max-width: 767px) {
    overflow: hidden;
    width: 100%;
    min-height: 100vh;
    min-height: 100dvh;
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

export const RegisterCard = styled(Card).attrs(() =>
  dataQaAttrs("layout-register-card"),
)`
  width: 100%;
  max-width: 464px;
  border: none;
  box-shadow: none;
  background: transparent;

  .ant-card-body {
    padding: 0;
  }

  ${authFormInputStyles}

  .ant-form-item-has-error .ant-form-item-extra {
    display: none;
  }
`;

export const ImageSide = styled.section.attrs(() =>
  dataQaAttrs("layout-register-image-side"),
)`
  min-height: 100vh;
  min-height: 100dvh;
  background-image: url("/background-images/login-cover.jpg");
  background-size: cover;
  background-position: center;

  @media (max-width: 767px) {
    display: none;
  }
`;

export const Header = styled.div`
  margin-bottom: 32px;
`;

export const PageTitle = styled.h1`
  margin: 0 0 12px;
  font-size: 32px;
  line-height: 1.2;
`;

export const PageDescription = styled.p`
  margin: 0;
  color: ${(props) => props.theme.colors.functional.text.subdued};
  font-size: 16px;
  line-height: 1.5;
`;

export const TwoColumnFields = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 575px) {
    grid-template-columns: 1fr;
    gap: 0;
  }
`;

export const FieldHint = styled.p`
  margin: -8px 0 24px;
  color: ${(props) => props.theme.colors.functional.text.subdued};
  font-size: 14px;
  line-height: 1.5;
`;

export const FormActions = styled.div`
  margin-top: 24px;
`;

export const Footer = styled.div`
  margin-top: 24px;
  text-align: center;
  color: ${(props) => props.theme.colors.functional.text.subdued};
  font-size: 14px;
  line-height: 1.5;
`;

export const FooterLink = styled.a`
  color: ${(props) => props.theme.colors.semantic.primary};
  font-weight: 500;

  &:hover {
    color: ${(props) => props.theme.colors.semantic.primary};
    opacity: 0.85;
  }
`;

export const InlineLink = styled.a`
  color: ${(props) => props.theme.colors.semantic.primary};

  &:hover {
    color: ${(props) => props.theme.colors.semantic.primary};
    opacity: 0.85;
  }
`;

export const Disclaimer = styled.p`
  margin: 32px 0 0;
  text-align: center;
  color: ${(props) => props.theme.colors.functional.text.subdued};
  font-size: 12px;
  line-height: 1.5;
`;

export const StateCard = styled.div`
  padding: 24px 0;
`;
