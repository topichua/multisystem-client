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
  layout?: "desktop" | "mobile";
  onConnectType: (type: IntegrationType) => void;
  onDisconnect: (integration: IntegrationItem) => void;
};

export const IntegrationTypeCard = ({
  connectLoading,
  definition,
  integrations,
  isDisconnecting,
  layout = "desktop",
  onConnectType,
  onDisconnect,
}: IntegrationTypeCardProps) => {
  const { t } = useTranslation();
  const hasConnections = integrations.length > 0;
  const isMobile = layout === "mobile";

  const connectButton = (
    <Button
      block={isMobile}
      icon={<PlusIcon />}
      loading={connectLoading}
      type={
        isMobile && !hasConnections ? "primary" : isMobile ? "default" : "text"
      }
      data-qa={
        isMobile
          ? `settings-mobile-integration-connect-${definition.type}`
          : undefined
      }
      onClick={() => onConnectType(definition.type)}
    >
      {t(definition.connectLabelKey)}
    </Button>
  );

  if (isMobile) {
    return (
      <S.IntegrationCard
        data-qa={`settings-mobile-integration-provider-${definition.type}`}
      >
        <S.MobileIntegrationCardHeader>
          <S.IntegrationCardIdentity>
            <S.IntegrationCardIcon>{definition.icon}</S.IntegrationCardIcon>
            <S.IntegrationCardText>
              <S.IntegrationCardTitle>
                {t(definition.labelKey)}
              </S.IntegrationCardTitle>
              <S.IntegrationCardDescription>
                {t(definition.descriptionKey)}
              </S.IntegrationCardDescription>
              {hasConnections ? (
                <S.MobileConnectedCount>
                  {t("integrations.mobile.connectedAccountsCount", {
                    count: integrations.length,
                  })}
                </S.MobileConnectedCount>
              ) : null}
            </S.IntegrationCardText>
          </S.IntegrationCardIdentity>

          {connectButton}
        </S.MobileIntegrationCardHeader>

        {hasConnections ? (
          <>
            <S.IntegrationCardDivider />
            <S.IntegrationAccountsList>
              {integrations.map((integration) => (
                <IntegrationAccountCard
                  key={`${integration.type}-${integration.id}-${integration.connectedAt}`}
                  integration={integration}
                  isDisconnecting={isDisconnecting(
                    integration.type,
                    integration.id,
                  )}
                  layout="mobile"
                  onDisconnect={onDisconnect}
                />
              ))}
            </S.IntegrationAccountsList>
          </>
        ) : (
          <S.IntegrationEmptyState>
            {t("integrations.noActiveConnections", {
              name: t(definition.labelKey),
            })}
          </S.IntegrationEmptyState>
        )}
      </S.IntegrationCard>
    );
  }

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
        <Flex flex="0 0 auto">{connectButton}</Flex>
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
          {t("integrations.noActiveConnections", {
            name: t(definition.labelKey),
          })}
        </S.IntegrationEmptyState>
      )}
    </S.IntegrationCard>
  );
};
