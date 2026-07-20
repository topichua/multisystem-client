import { CheckIcon } from "@phosphor-icons/react";
import { Alert, Button, Flex, Select, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
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
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);

  useEffect(() => {
    if (stage !== "select_page") {
      setSelectedPageId(null);
      return;
    }

    if (pages.length === 1) {
      setSelectedPageId(pages[0].pageId);
      return;
    }

    setSelectedPageId((current) =>
      current && pages.some((page) => page.pageId === current) ? current : null,
    );
  }, [pages, stage]);

  const pageOptions = useMemo(
    () =>
      pages.map((page) => ({
        value: page.pageId,
        label: page.pageName,
      })),
    [pages],
  );

  if (stage === "facebook_login") {
    return (
      <S.InstagramSetup>
        {errorMessage ? (
          <Alert
            type="error"
            showIcon
            message={errorMessage}
            style={{ marginBottom: 16 }}
          />
        ) : null}

        <Typography.Text type="secondary">
          {t("integrations.instagramSetup.facebookHint")}
        </Typography.Text>

        <S.FacebookContinueButton
          block
          loading={connecting}
          disabled={connecting || awaitingOauth}
          icon={<FacebookLogoIcon size={16} />}
          onClick={onContinueWithFacebook}
        >
          {t("integrations.instagramSetup.continueWithFacebook")}
        </S.FacebookContinueButton>

        {awaitingOauth ? (
          <Typography.Text type="secondary">
            {t("integrations.instagramSetup.awaitingOauth")}
          </Typography.Text>
        ) : null}
      </S.InstagramSetup>
    );
  }

  return (
    <S.InstagramSetup>
      {sessionExpired ? (
        <Alert
          type="warning"
          showIcon
          message={t("integrations.instagramSetup.sessionExpired")}
          action={
            <Button size="small" type="link" onClick={onRestart}>
              {t("integrations.instagramSetup.restart")}
            </Button>
          }
          style={{ marginBottom: 16 }}
        />
      ) : null}

      {errorMessage && !sessionExpired ? (
        <Alert
          type="error"
          showIcon
          message={errorMessage}
          style={{ marginBottom: 16 }}
        />
      ) : null}

      {pages.length === 0 && !sessionExpired ? (
        <Alert
          type="info"
          showIcon
          message={t("integrations.instagramSetup.noPages")}
          action={
            <Button size="small" type="link" onClick={onRestart}>
              {t("integrations.instagramSetup.restart")}
            </Button>
          }
          style={{ marginBottom: 16 }}
        />
      ) : null}

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
          onChange={(value) => setSelectedPageId(value ?? null)}
        />
      </S.InstagramPageField>

      <S.InstagramSetupFooter>
        <Button disabled={confirming} onClick={onCancel}>
          {t("integrations.instagramSetup.cancel")}
        </Button>
        <Button
          type="primary"
          icon={<CheckIcon />}
          loading={confirming}
          disabled={
            sessionExpired || !selectedPageId || pages.length === 0 || confirming
          }
          onClick={() => {
            if (selectedPageId) {
              onConfirm(selectedPageId);
            }
          }}
        >
          <Flex align="center" gap={6}>
            {t("integrations.instagramSetup.connect")}
          </Flex>
        </Button>
      </S.InstagramSetupFooter>
    </S.InstagramSetup>
  );
}
