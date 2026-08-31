import { TranslateIcon } from "@phosphor-icons/react";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

import {
  LANGUAGE_OPTIONS,
  useWorkspaceLanguage,
} from "@/features/workspace-settings/model/use-workspace-language";

import * as S from "./language-preference-control.styled";

export const LanguagePreferenceControl = observer(() => {
  const { t } = useTranslation();
  const { language, languageDisabled, changeLanguage } = useWorkspaceLanguage();

  return (
    <S.Row
      $disabled={languageDisabled}
      data-qa="layout-mobile-navigation-language"
    >
      <S.Icon>
        <TranslateIcon size={20} />
      </S.Icon>

      <S.Label>{t("system.language")}</S.Label>

      <S.LanguageSegmented
        size="small"
        value={language}
        disabled={languageDisabled}
        options={[
          { label: LANGUAGE_OPTIONS.uk.code, value: "uk" },
          { label: LANGUAGE_OPTIONS.en.code, value: "en" },
        ]}
        aria-label={t("appHeader.changeLanguage")}
        onChange={(value) => {
          void changeLanguage(String(value));
        }}
      />
    </S.Row>
  );
});
