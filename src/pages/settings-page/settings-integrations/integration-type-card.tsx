import { PlusIcon } from "@phosphor-icons/react";
import { Button, Flex } from "antd";
import { useTranslation } from "react-i18next";

import type { IntegrationItem } from "@/features/integrations/model/integration.types";

import { IntegrationAccountCard } from "./integration-account-card";
import type {
  IntegrationDefinition,
  IntegrationType,
} from "./settings-integrations.definitions";
import * as S from "./settings-integrations.styled";

type IntegrationTypeCardProps = {
  connectLoading: boolean;
  definition: IntegrationDefinition;
  integrations: IntegrationItem[];
  isDisconnecting: (type: IntegrationItem["type"], id: number) => boolean;
  onConnectType: (type: IntegrationType) => void;
  onDisconnect: (integration: IntegrationItem) => void;
};

export const IntegrationTypeCard = ({
  connectLoading,
  definition,
  integrations,
  isDisconnecting,
  onConnectType,
  onDisconnect,
}: IntegrationTypeCardProps) => {
  const { t } = useTranslation();
  const hasConnections = integrations.length > 0;

  return (
    <S.IntegrationCard>
      <S.IntegrationCardHeader>
        <S.IntegrationCardIdentity>
          <S.IntegrationCardIcon>{definition.icon}</S.IntegrationCardIcon>
          <S.IntegrationCardText>
            <S.IntegrationCardTitle>
              {t(definition.labelKey)}
            </S.IntegrationCardTitle>
            <S.IntegrationCardDescription>
              {t(definition.descriptionKey)}
            </S.IntegrationCardDescription>
          </S.IntegrationCardText>
        </S.IntegrationCardIdentity>
        <Flex flex="0 0 auto">
          <Button
            icon={<PlusIcon />}
            loading={connectLoading}
            type="text"
            onClick={() => onConnectType(definition.type)}
          >
            {t(definition.connectLabelKey)}
          </Button>
        </Flex>
      </S.IntegrationCardHeader>

      <S.IntegrationCardDivider />

      {hasConnections ? (
        <S.IntegrationAccountsList>
          {integrations.map((integration) => (
            <IntegrationAccountCard
              key={`${integration.type}-${integration.id}-${integration.connectedAt}`}
              integration={integration}
              isDisconnecting={isDisconnecting(
                integration.type,
                integration.id,
              )}
              onDisconnect={onDisconnect}
            />
          ))}
        </S.IntegrationAccountsList>
      ) : (
        <S.IntegrationEmptyState>
          {t('integrations.noActiveConnections', {
            name: t(definition.labelKey),
          })}
        </S.IntegrationEmptyState>
      )}
    </S.IntegrationCard>
  );
};
