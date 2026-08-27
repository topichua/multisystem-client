import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

import * as S from "../desktop-app-header.styled";

export const HeaderSearch = () => {
  const { t } = useTranslation();

  return (
    <S.SearchField data-qa="layout-desktop-search">
      <S.SearchInput
        allowClear
        prefix={<MagnifyingGlassIcon size={16} />}
        aria-label={t("appHeader.searchAria")}
        placeholder={t("appHeader.searchPlaceholder")}
        disabled
      />
    </S.SearchField>
  );
};
