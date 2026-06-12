import { ArrowLeftIcon } from "@phosphor-icons/react";
import { Button, Empty, Flex, Spin } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";

import { InstagramIntegrationGate } from "./components/instagram-integration-gate";
import { InstagramPageShell } from "./components/instagram-page-shell";
import { InstagramPostDetailContent } from "./components/instagram-post-detail-content";
import { useInstagramPostPageController } from "./controllers/use-instagram-post-page-controller";
import * as S from "./instagram-page.styled";

export const InstagramPostPage = () => {
  const { postId } = useParams<{ postId: string }>();

  return <InstagramPostPageContent key={postId ?? "missing"} />;
};

const InstagramPostPageContent = observer(() => {
  const { t } = useTranslation();
  const controller = useInstagramPostPageController();
  const { selectedIntegration, post } = controller;

  return (
    <InstagramPageShell
      controller={controller}
      onSelectIntegration={controller.handleSelectIntegration}
    >
      <PaneDetailLayout.Root inset>
        <PaneDetailLayout.Header>
          <Flex align="center" gap={16}>
            <Button
              icon={<ArrowLeftIcon size={16} />}
              onClick={controller.navigateBack}
            >
              {t("instagram.backToPosts")}
            </Button>
          </Flex>
        </PaneDetailLayout.Header>

        <PaneDetailLayout.Body data-qa="layout-instagram-post-scroll">
          <InstagramIntegrationGate controller={controller}>
            {controller.initialMediaLoading ? (
              <S.CenteredState>
                <Spin />
              </S.CenteredState>
            ) : !post ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={t("instagram.postDetailsUnavailable")}
                style={{ marginTop: 48 }}
              >
                <Button onClick={controller.navigateBack}>
                  {t("instagram.backToPosts")}
                </Button>
              </Empty>
            ) : (
              <InstagramPostDetailContent
                controller={controller}
                post={post}
                selectedIntegration={selectedIntegration!}
              />
            )}
          </InstagramIntegrationGate>
        </PaneDetailLayout.Body>
      </PaneDetailLayout.Root>
    </InstagramPageShell>
  );
});
