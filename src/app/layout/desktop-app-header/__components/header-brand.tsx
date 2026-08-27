import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { pagesMap } from "@/app/router/pages-map";

import * as S from "../desktop-app-header.styled";

export const HeaderBrand = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <S.BrandButton
      type="text"
      aria-label={t("nav.returnWorkspaceHomeAria")}
      onClick={() => navigate(pagesMap.home)}
    >
      <S.BrandLogo src="/logos/logo.png" alt="" aria-hidden="true" />
    </S.BrandButton>
  );
};
