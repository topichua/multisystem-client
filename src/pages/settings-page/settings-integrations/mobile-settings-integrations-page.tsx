import { ArrowLeftIcon } from "@phosphor-icons/react";
import { Flex, Spin } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { pagesMap } from "@/app/router/pages-map";
import { dataQaAttrs } from "@/styled/data-qa-attrs";

import * as MobileS from "../mobile-settings-page.styled";
import { useSettingsIntegrationsController } from "./controllers/use-settings-integrations-controller";
import { IntegrationTypeCard } from "./integration-type-card";
import { INTEGRATION_TYPES } from "./settings-integrations.definitions";
import * as S from "./settings-integrations.styled";
import { TelegramQrLoginModal } from "./telegram-qr-login-modal";

export const MobileSettingsIntegrationsPage = observer(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const controller = useSettingsIntegrationsController();
  const { store } = controller;

  return (
    <>
      <MobileS.Root {...dataQaAttrs("settings-mobile-integrations-page")}>
        <MobileS.PageHeader>
          <MobileS.TitleRow>
            <MobileS.IconBackButton
              type="text"
              icon={<ArrowLeftIcon size={20} />}
              aria-label={t("integrations.mobile.backToSettingsAria")}
              data-qa="settings-mobile-integrations-back"
              onClick={() => navigate(pagesMap.settings)}
            />
            <MobileS.PageTitle level={3}>
              {t("integrations.title")}
            </MobileS.PageTitle>
          </MobileS.TitleRow>
          <MobileS.PageSubtitle>
            {t("integrations.subtitle")}
          </MobileS.PageSubtitle>
        </MobileS.PageHeader>

        <MobileS.ScrollRegion>
          <MobileS.ContentSection>
            {store.listLoading ? (
              <Flex
                align="center"
                justify="center"
                style={{ padding: "48px 0" }}
              >
                <Spin />
              </Flex>
            ) : (
              <S.MobileIntegrationsStack>
                {INTEGRATION_TYPES.map((definition) => (
                  <IntegrationTypeCard
                    key={definition.type}
                    connectLoading={store.isConnecting(definition.type)}
                    definition={definition}
                    integrations={
                      controller.integrationsByType[definition.type]
                    }
                    isDisconnecting={(type, id) =>
                      store.isDisconnecting(type, id)
                    }
                    layout="mobile"
                    onConnectType={(type) =>
                      void controller.handleConnectType(type)
                    }
                    onDisconnect={controller.handleDisconnect}
                  />
                ))}
              </S.MobileIntegrationsStack>
            )}
          </MobileS.ContentSection>
        </MobileS.ScrollRegion>
      </MobileS.Root>

      <TelegramQrLoginModal
        open={controller.telegramQrModal.open}
        qrImageUrl={controller.telegramQrModal.session?.qrImageUrl ?? null}
        status={controller.telegramQrModal.status}
        onCancel={controller.closeTelegramQrModal}
        onRetry={controller.retryTelegramQrLogin}
      />
    </>
  );
});
