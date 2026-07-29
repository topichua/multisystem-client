import { Button } from "antd";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { pagesMap } from "@/app/router/pages-map";

import * as S from "./not-found-page.styled";

export const NotFoundPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <S.Root>
      <S.WaveTop viewBox="0 0 1440 160" preserveAspectRatio="none" aria-hidden>
        <path d="M0 0h1440v72c-120 48-240 72-390 64-180-10-280-54-470-54S260 98 0 128V0Z" />
      </S.WaveTop>
      <S.WaveBottom
        viewBox="0 0 1440 160"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path d="M0 160h1440V88c-130-40-250-58-400-50-190 10-300 52-490 52S250 70 0 40v120Z" />
      </S.WaveBottom>

      <S.Stage>
        <S.Illustration />
        <S.Copy>
          <S.Code>404</S.Code>
          <S.Title>{t("notFound.title")}</S.Title>
          <S.Description>{t("notFound.description")}</S.Description>
          <S.Actions>
            <Button
              type="primary"
              size="large"
              data-qa="not-found-go-home"
              onClick={() => navigate(pagesMap.home)}
            >
              {t("notFound.goHome")}
            </Button>
          </S.Actions>
        </S.Copy>
      </S.Stage>
    </S.Root>
  );
};
