import { Card } from "antd";
import styled from "styled-components";

import { dataQaAttrs } from "@/styled/data-qa-attrs";

export const Page = styled.main.attrs(() => dataQaAttrs("layout-invitation"))`
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
  dataQaAttrs("layout-invitation-form-side"),
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

export const InvitationCard = styled(Card).attrs(() =>
  dataQaAttrs("layout-invitation-card"),
)`
  width: 100%;
  max-width: 464px;
  border: none;
  box-shadow: none;
  background: transparent;

  .ant-card-body {
    padding: 0;
  }
`;

export const ImageSide = styled.section.attrs(() =>
  dataQaAttrs("layout-invitation-image-side"),
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

export const NameFields = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 575px) {
    grid-template-columns: 1fr;
    gap: 0;
  }
`;

export const FormActions = styled.div`
  margin-top: 24px;
`;

export const StateCard = styled.div`
  padding: 24px 0;
`;
