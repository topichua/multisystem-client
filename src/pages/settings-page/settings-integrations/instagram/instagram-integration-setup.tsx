import { CheckIcon } from "@phosphor-icons/react";
import { Alert, Button, Flex, Select, Spin, Typography } from "antd";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { FacebookLogoIcon } from "@/components/icons/facebook/facebook-logo-icon";
import type { InstagramOAuthPage } from "@/features/integrations/model/instagram-oauth.types";

import * as S from "../settings-integrations.styled";

export type InstagramSetupStage = "facebook_login" | "select_page";

type InstagramIntegrationSetupProps = {
  stage: InstagramSetupStage;
  pages: InstagramOAuthPage[];
  connecting: boolean;
  awaitingOauth: boolean;
  confirming: boolean;
  sessionExpired: boolean;
  errorMessage: string | null;
  onContinueWithFacebook: () => void;
  onConfirm: (pageId: string) => void;
  onCancel: () => void;
  onRestart: () => void;
};

type InstagramSelectPageSetupProps = Omit<
  InstagramIntegrationSetupProps,
  "stage" | "connecting" | "awaitingOauth" | "onContinueWithFacebook"
>;

function InstagramSelectPageSetup({
  pages,
  confirming,
  sessionExpired,
  errorMessage,
  onConfirm,
  onCancel,
  onRestart,
}: InstagramSelectPageSetupProps) {
  const { t } = useTranslation();
  const [manualPageId, setManualPageId] = useState<string | null>(null);

  const selectedPageId = useMemo(() => {
    if (pages.length === 1) {
      return pages[0].pageId;
    }

    if (manualPageId && pages.some((page) => page.pageId === manualPageId)) {
      return manualPageId;
    }

    return null;
  }, [manualPageId, pages]);

  const pageOptions = useMemo(
    () =>
      pages.map((page) => ({
        value: page.pageId,
        label: page.pageName,
      })),
    [pages],
  );

  return (
    <S.InstagramSetup>
      {sessionExpired && (
        <Alert
          type="warning"
          showIcon
          title={t("integrations.instagramSetup.sessionExpired")}
          action={
            <Button size="small" type="link" onClick={onRestart}>
              {t("integrations.instagramSetup.restart")}
            </Button>
          }
          style={{ marginBottom: 16 }}
        />
      )}

      {errorMessage && !sessionExpired && (
        <Alert
          type="error"
          showIcon
          title={errorMessage}
          style={{ marginBottom: 16 }}
        />
      )}

      {pages.length === 0 && !sessionExpired && (
        <Alert
          type="info"
          showIcon
          title={t("integrations.instagramSetup.noPages")}
          action={
            <Button size="small" type="link" onClick={onRestart}>
              {t("integrations.instagramSetup.restart")}
            </Button>
          }
          style={{ marginBottom: 16 }}
        />
      )}

      <S.InstagramPageField>
        <Typography.Text>
          {t("integrations.instagramSetup.pageLabel")}
        </Typography.Text>
        <Select
          allowClear={pages.length !== 1}
          disabled={sessionExpired || pages.length === 0 || confirming}
          options={pageOptions}
          placeholder={t("integrations.instagramSetup.pagePlaceholder")}
          value={selectedPageId}
          onChange={(value) => setManualPageId(value ?? null)}
        />
      </S.InstagramPageField>

      <S.InstagramSetupFooter>
        <S.FacebookLogoutButton
          disabled={confirming}
          icon={<FacebookLogoIcon size={16} />}
          onClick={onCancel}
        >
          {t("integrations.instagramSetup.logout")}
        </S.FacebookLogoutButton>
        <Button
          type="primary"
          icon={<CheckIcon />}
          loading={confirming}
          disabled={
            sessionExpired ||
            !selectedPageId ||
            pages.length === 0 ||
            confirming
          }
          onClick={() => {
            if (selectedPageId) {
              onConfirm(selectedPageId);
            }
          }}
        >
          {t("integrations.instagramSetup.connect")}
        </Button>
      </S.InstagramSetupFooter>
    </S.InstagramSetup>
  );
}

export function InstagramIntegrationSetup({
  stage,
  pages,
  connecting,
  awaitingOauth,
  confirming,
  sessionExpired,
  errorMessage,
  onContinueWithFacebook,
  onConfirm,
  onCancel,
  onRestart,
}: InstagramIntegrationSetupProps) {
  const { t } = useTranslation();

  if (stage === "facebook_login") {
    return (
      <S.InstagramSetup>
        {errorMessage && (
          <Alert
            type="error"
            showIcon
            title={errorMessage}
            style={{ marginBottom: 16 }}
          />
        )}

        <Typography.Text type="secondary">
          {t("integrations.instagramSetup.facebookHint")}
        </Typography.Text>

        {awaitingOauth ? (
          <Flex vertical gap={12} align="center">
            <Spin />
            <Typography.Text type="secondary">
              {t("integrations.instagramSetup.awaitingOauth")}
            </Typography.Text>
            <S.FacebookLogoutButton
              icon={<FacebookLogoIcon size={16} />}
              onClick={onCancel}
            >
              {t("integrations.instagramSetup.logout")}
            </S.FacebookLogoutButton>
          </Flex>
        ) : (
          <>
            <S.FacebookContinueButton
              block
              loading={connecting}
              disabled={connecting}
              icon={<FacebookLogoIcon size={16} />}
              onClick={onContinueWithFacebook}
            >
              {t("integrations.instagramSetup.continueWithFacebook")}
            </S.FacebookContinueButton>

            <S.InstagramSetupFooter>
              <Button disabled={connecting} onClick={onCancel}>
                {t("integrations.instagramSetup.cancel")}
              </Button>
            </S.InstagramSetupFooter>
          </>
        )}
      </S.InstagramSetup>
    );
  }

  return (
    <InstagramSelectPageSetup
      pages={pages}
      confirming={confirming}
      sessionExpired={sessionExpired}
      errorMessage={errorMessage}
      onConfirm={onConfirm}
      onCancel={onCancel}
      onRestart={onRestart}
    />
  );
}
