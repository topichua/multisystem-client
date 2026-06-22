import { Alert, Empty, Spin } from "antd";
import { observer } from "mobx-react-lite";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router";

import { pagesMap } from "@/app/router/pages-map";

import type { InstagramPageController } from "../../controllers/use-instagram-page-controller";
import * as S from "../../instagram-page.styled";

type InstagramIntegrationGateProps = {
  controller: InstagramPageController;
  children: ReactNode;
};

export const InstagramIntegrationGate = observer(
  ({ controller, children }: InstagramIntegrationGateProps) => {
    const { t } = useTranslation();
    const { store } = controller;
    const selectedIntegration = store.selectedIntegration;
    const initialListLoading =
      !store.listLoaded ||
      (store.listLoading && store.integrations.length === 0);

    return (
      <>
        {store.listError ? (
          <Alert
            type="error"
            showIcon
            title={store.listError}
            style={{ marginBottom: 16 }}
          />
        ) : null}

        {initialListLoading ? (
          <S.CenteredState>
            <Spin />
          </S.CenteredState>
        ) : store.integrations.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t("instagram.emptyDescription")}
            style={{ marginTop: 48 }}
          >
            <RouterLink to={pagesMap.settingsIntegrations}>
              {t("instagram.openIntegrations")}
            </RouterLink>
          </Empty>
        ) : selectedIntegration == null ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t("instagram.chooseIntegration")}
            style={{ marginTop: 48 }}
          />
        ) : (
          children
        )}
      </>
    );
  },
);
