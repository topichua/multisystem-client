import { Switch } from "antd";
import { useTranslation } from "react-i18next";

import type { IntegrationItem } from "@/features/integrations/model/integration.types";

import * as S from "./settings-integrations.styled";

type IntegrationAccountCardProps = {
  integration: IntegrationItem;
  isDisconnecting: boolean;
  onDisconnect: (integration: IntegrationItem) => void;
};

export function IntegrationAccountCard({
  integration,
  isDisconnecting,
  onDisconnect,
}: IntegrationAccountCardProps) {
  const { t } = useTranslation();

  return (
    <S.IntegrationAccountRow>
      <S.IntegrationAccountInfo>
        <S.IntegrationAccountName>{integration.name}</S.IntegrationAccountName>
        <S.IntegrationConnectedStatus>
          {t("integrations.connectedTag")}
        </S.IntegrationConnectedStatus>
      </S.IntegrationAccountInfo>
      <Switch
        checked
        loading={isDisconnecting}
        onChange={(checked) => {
          if (!checked) {
            onDisconnect(integration);
          }
        }}
      />
    </S.IntegrationAccountRow>
  );
}
