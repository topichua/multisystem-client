import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

import { InstagramIntegrationGate } from "./components/integrations/instagram-integration-gate";
import { InstagramMediaContent } from "./components/media/instagram-media-content";
import { InstagramMobileAccountSwitcher } from "./components/mobile/instagram-mobile-account-switcher";
import { InstagramProfileHeader } from "./components/shared/instagram-profile-header";
import { useInstagramPageController } from "./controllers/use-instagram-page-controller";
import * as S from "./mobile-instagram-page.styled";

export const MobileInstagramPage = observer(() => {
  const { t } = useTranslation();
  const controller = useInstagramPageController();
  const { store } = controller;
  const { selectedIntegration } = store;

  return (
    <S.Root data-qa="instagram-mobile-page">
      <S.Header>
        <S.HeaderTopRow>
          <S.PageTitle level={3}>{t("instagram.pageTitle")}</S.PageTitle>
        </S.HeaderTopRow>

        <InstagramMobileAccountSwitcher
          integrations={store.integrations}
          loading={controller.initialListLoading}
          selectedKey={controller.selectedKey}
          onSelect={controller.selectIntegrationKey}
        />
      </S.Header>

      <S.Content>
        <InstagramIntegrationGate controller={controller}>
          {selectedIntegration ? (
            <>
              <S.ProfilePanel>
                <InstagramProfileHeader
                  integration={selectedIntegration}
                  mediaPaging={store.mediaPaging}
                />
              </S.ProfilePanel>
              <S.MediaPanel>
                <InstagramMediaContent
                  controller={controller}
                  onPostClick={controller.openPostDetails}
                />
              </S.MediaPanel>
            </>
          ) : null}
        </InstagramIntegrationGate>
      </S.Content>
    </S.Root>
  );
});
