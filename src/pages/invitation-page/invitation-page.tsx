import { Alert, Button, Result, Spin } from "antd";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { pagesMap } from "@/app/router/pages-map";

import * as S from "./invitation-page.styled";
import {
  useInvitationRegistration,
  type InvitationFormValues,
} from "./use-invitation-registration";
import { InvitationForm } from "./invitation-form";

export const InvitationPage = () => {
  const navigate = useNavigate();

  const { form, loadState, submitState, submit } = useInvitationRegistration();

  useEffect(() => {
    if (submitState.status !== "success") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      navigate(pagesMap.login, { replace: true });
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [navigate, submitState.status]);

  return (
    <S.Page>
      <S.FormSide>
        <S.InvitationCard>
          <InvitationContent
            form={form}
            loadState={loadState}
            submitState={submitState}
            onSubmit={submit}
          />
        </S.InvitationCard>
      </S.FormSide>

      <S.ImageSide />
    </S.Page>
  );
};

type InvitationContentProps = {
  form: ReturnType<typeof useInvitationRegistration>["form"];
  loadState: ReturnType<typeof useInvitationRegistration>["loadState"];
  submitState: ReturnType<typeof useInvitationRegistration>["submitState"];
  onSubmit: (values: InvitationFormValues) => Promise<void>;
};

const InvitationContent = ({
  form,
  loadState,
  submitState,
  onSubmit,
}: InvitationContentProps) => {
  const { t } = useTranslation();

  if (loadState.status === "loading") {
    return (
      <S.StateCard>
        <Spin />
      </S.StateCard>
    );
  }

  if (loadState.status === "missing-token") {
    return <InvitationErrorState message={t("invitation.missingToken")} />;
  }

  if (loadState.status === "error") {
    return (
      <InvitationErrorState
        message={getApiErrorMessage(loadState.error, t("invitation.loadError"))}
      />
    );
  }

  if (submitState.status === "success") {
    return (
      <Result
        status="success"
        title={t("invitation.successTitle")}
        subTitle={t("invitation.successDescription")}
        extra={
          <Link to={pagesMap.login}>
            <Button type="primary">{t("invitation.goToLogin")}</Button>
          </Link>
        }
      />
    );
  }

  const submitError =
    submitState.status === "error"
      ? submitState.error
        ? getApiErrorMessage(submitState.error, t("invitation.submitError"))
        : t("invitation.submitError")
      : null;

  return (
    <InvitationForm
      form={form}
      inviteInfo={loadState.info}
      isSubmitting={submitState.status === "submitting"}
      submitError={submitError}
      onSubmit={onSubmit}
    />
  );
};

type InvitationErrorStateProps = {
  message: string;
};

const InvitationErrorState = ({ message }: InvitationErrorStateProps) => {
  const { t } = useTranslation();

  return (
    <>
      <Alert
        type="error"
        showIcon
        title={message}
        style={{ marginBottom: 24 }}
      />

      <S.Footer>
        <Link to={pagesMap.login}>{t("invitation.goToLogin")}</Link>
      </S.Footer>
    </>
  );
};
