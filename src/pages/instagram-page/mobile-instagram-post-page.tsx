import { ArrowLeftIcon } from "@phosphor-icons/react";
import { Button, Empty, Spin } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import { InstagramIntegrationGate } from "./components/integrations/instagram-integration-gate";
import { InstagramMobileAccountSwitcher } from "./components/mobile/instagram-mobile-account-switcher";
import { InstagramPostDetailContent } from "./components/post-detail/instagram-post-detail-content";
import { useInstagramPostPageController } from "./controllers/use-instagram-post-page-controller";
import * as InstagramPageStyles from "./instagram-page.styled";
import * as S from "./mobile-instagram-page.styled";

export const MobileInstagramPostPage = () => {
  const { postId } = useParams<{ postId: string }>();

  return <MobileInstagramPostPageContent key={postId ?? "missing"} />;
};

const MobileInstagramPostPageContent = observer(() => {
  const { t } = useTranslation();
  const controller = useInstagramPostPageController();
  const { store } = controller;

  const renderContent = () => {
    if (controller.initialMediaLoading) {
      return (
        <InstagramPageStyles.CenteredState>
          <Spin />
        </InstagramPageStyles.CenteredState>
      );
    }

    if (!controller.post) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t("instagram.postDetailsUnavailable")}
          style={{ marginTop: 48 }}
        >
          <Button onClick={controller.navigateBack}>
            {t("instagram.backToPosts")}
          </Button>
        </Empty>
      );
    }

    return (
      <InstagramPostDetailContent
        variant="mobile"
        controller={controller}
        post={controller.post}
        selectedIntegration={controller.selectedIntegration!}
      />
    );
  };

  return (
    <S.Root data-qa="instagram-mobile-post-page">
      <S.Header>
        <S.HeaderTopRow>
          <S.BackButton
            type="text"
            icon={<ArrowLeftIcon size={20} />}
            aria-label={t("instagram.backToPosts")}
            data-qa="instagram-mobile-post-back"
            onClick={controller.navigateBack}
          />
          <S.PageTitle level={3}>{t("instagram.postDetailsTitle")}</S.PageTitle>
        </S.HeaderTopRow>

        <InstagramMobileAccountSwitcher
          integrations={store.integrations}
          loading={controller.initialListLoading}
          selectedKey={controller.selectedKey}
          onSelect={controller.handleSelectIntegration}
        />
      </S.Header>

      <S.DetailPanel>
        <InstagramIntegrationGate controller={controller}>
          {renderContent()}
        </InstagramIntegrationGate>
      </S.DetailPanel>
    </S.Root>
  );
});
