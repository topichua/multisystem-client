import { Button, Empty, Spin } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";

import { InstagramIntegrationGate } from "./components/integrations/instagram-integration-gate";
import { InstagramPageShell } from "./components/shared/instagram-page-shell";
import { InstagramPostDetailContent } from "./components/post-detail/instagram-post-detail-content";
import { useInstagramPostPageController } from "./controllers/use-instagram-post-page-controller";
import * as S from "./instagram-page.styled";

export const InstagramPostPage = () => {
  const { postId } = useParams<{ postId: string }>();

  return <InstagramPostPageContent key={postId ?? "missing"} />;
};

const InstagramPostPageContent = observer(() => {
  const { t } = useTranslation();
  const controller = useInstagramPostPageController();

  const renderContent = () => {
    if (controller.initialMediaLoading) {
      return (
        <S.CenteredState>
          <Spin />
        </S.CenteredState>
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
        controller={controller}
        post={controller.post}
        selectedIntegration={controller.selectedIntegration!}
      />
    );
  };

  return (
    <InstagramPageShell
      controller={controller}
      onSelectIntegration={controller.handleSelectIntegration}
    >
      <PaneDetailLayout.Root inset>
        <PaneDetailLayout.Body
          data-qa="layout-instagram-post-scroll"
          style={{ overflow: "hidden", padding: 0 }}
        >
          <InstagramIntegrationGate controller={controller}>
            {renderContent()}
          </InstagramIntegrationGate>
        </PaneDetailLayout.Body>
      </PaneDetailLayout.Root>
    </InstagramPageShell>
  );
});
