import { Alert, Button, Result, Spin } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { pagesMap } from "@/app/router/pages-map";
import { authApi } from "@/features/auth/api/auth-api";

import * as S from "./register-page.styled";

type ConfirmationState =
  | { status: "loading" }
  | { status: "success" }
  | { status: "missing-token" }
  | { status: "error"; error: unknown };

type ConfirmationResult =
  | { status: "success" }
  | { status: "error"; error: unknown };

const confirmationRequests = new Map<string, Promise<ConfirmationResult>>();

const confirmRegistrationToken = (
  token: string,
): Promise<ConfirmationResult> => {
  const existingRequest = confirmationRequests.get(token);

  if (existingRequest) {
    return existingRequest;
  }

  const request = authApi
    .registerConfirm({ token })
    .then((): ConfirmationResult => ({ status: "success" }))
    .catch((error): ConfirmationResult => {
      confirmationRequests.delete(token);

      return { status: "error", error };
    });

  confirmationRequests.set(token, request);

  return request;
};

export const RegisterConfirmPage = () => {
  const navigate = useNavigate();
  const { token: pathToken } = useParams<{ token?: string }>();
  const [searchParams] = useSearchParams();

  const confirmationToken =
    searchParams.get("token") ?? searchParams.get("hash") ?? pathToken;

  const [confirmationResult, setConfirmationResult] = useState<{
    token: string;
    result: ConfirmationResult;
  } | null>(null);

  const state: ConfirmationState = (() => {
    if (!confirmationToken) {
      return { status: "missing-token" };
    }

    if (confirmationResult?.token === confirmationToken) {
      return confirmationResult.result;
    }

    return { status: "loading" };
  })();

  useEffect(() => {
    if (!confirmationToken) {
      return;
    }

    let isActive = true;

    const confirmRegistration = async () => {
      const result = await confirmRegistrationToken(confirmationToken);

      if (isActive) {
        setConfirmationResult({
          token: confirmationToken,
          result,
        });
      }
    };

    void confirmRegistration();

    return () => {
      isActive = false;
    };
  }, [confirmationToken]);

  useEffect(() => {
    if (state.status !== "success") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      navigate(pagesMap.login, { replace: true });
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [navigate, state.status]);

  return (
    <S.Page>
      <S.FormSide>
        <S.RegisterCard>
          <RegisterConfirmContent state={state} />
        </S.RegisterCard>
      </S.FormSide>

      <S.ImageSide />
    </S.Page>
  );
};

type RegisterConfirmContentProps = {
  state: ConfirmationState;
};

const RegisterConfirmContent = ({ state }: RegisterConfirmContentProps) => {
  const { t } = useTranslation();

  switch (state.status) {
    case "loading":
      return (
        <S.StateCard>
          <Spin />
        </S.StateCard>
      );

    case "success":
      return (
        <Result
          status="success"
          title={t("register.confirmSuccessTitle")}
          subTitle={t("register.confirmSuccessDescription")}
          extra={
            <Link to={pagesMap.login}>
              <Button type="primary">{t("register.goToLogin")}</Button>
            </Link>
          }
        />
      );

    case "missing-token":
      return (
        <RegisterConfirmError message={t("register.confirmMissingToken")} />
      );

    case "error":
      return (
        <RegisterConfirmError
          message={getApiErrorMessage(state.error, t("register.confirmError"))}
        />
      );
  }
};

type RegisterConfirmErrorProps = {
  message: string;
};

const RegisterConfirmError = ({ message }: RegisterConfirmErrorProps) => {
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
        <Link to={pagesMap.login}>{t("register.goToLogin")}</Link>
      </S.Footer>
    </>
  );
};
