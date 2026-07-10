import { useTranslation } from "react-i18next";

import * as S from "./settings-billing.styled";

export const BillingInfoBar = () => {
  const { t } = useTranslation();

  return (
    <S.InfoBar data-qa="billing-info-bar">
      {t("billing.infoBar.manualPayment")}
    </S.InfoBar>
  );
};
