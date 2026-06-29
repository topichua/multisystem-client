import { Form } from "antd";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router";

import { workspaceMembersApi } from "@/features/workspace-members/api/workspace-members-api";
import type { WorkspaceMemberRegisterInfo } from "@/features/workspace-members/model/workspace-member.types";

export type InvitationFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type InvitationLoadState =
  | { status: "missing-token" }
  | { status: "loading" }
  | {
      status: "ready";
      info: WorkspaceMemberRegisterInfo;
    }
  | {
      status: "error";
      error: unknown;
    };

type InvitationSubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success" }
  | {
      status: "error";
      error?: unknown;
    };

type InvitationLoadResult =
  | {
      status: "ready";
      info: WorkspaceMemberRegisterInfo;
    }
  | {
      status: "error";
      error: unknown;
    };

export const useInvitationRegistration = () => {
  const [form] = Form.useForm<InvitationFormValues>();
  const { token: pathToken } = useParams<{ token?: string }>();
  const [searchParams] = useSearchParams();

  const invitationHash =
    searchParams.get("token") ?? searchParams.get("hash") ?? pathToken;

  const [loadResult, setLoadResult] = useState<{
    hash: string;
    result: InvitationLoadResult;
  } | null>(null);

  const [submitResult, setSubmitResult] = useState<{
    hash: string;
    state: InvitationSubmitState;
  } | null>(null);

  const loadState: InvitationLoadState = (() => {
    if (!invitationHash) {
      return { status: "missing-token" };
    }

    if (loadResult?.hash === invitationHash) {
      return loadResult.result;
    }

    return { status: "loading" };
  })();

  const submitState: InvitationSubmitState =
    submitResult && submitResult.hash === invitationHash
      ? submitResult.state
      : { status: "idle" };

  useEffect(() => {
    if (!invitationHash) {
      return;
    }

    let isActive = true;

    const loadInvitation = async () => {
      form.resetFields();

      try {
        const info = await workspaceMembersApi.getRegisterInfo(invitationHash);

        if (!isActive) {
          return;
        }

        form.setFieldsValue({
          firstName: info.first_name ?? info.firstName ?? "",
          lastName: info.last_name ?? info.lastName ?? "",
          email: info.email,
        });

        setLoadResult({
          hash: invitationHash,
          result: {
            status: "ready",
            info,
          },
        });
      } catch (error) {
        if (!isActive) {
          return;
        }

        setLoadResult({
          hash: invitationHash,
          result: {
            status: "error",
            error,
          },
        });
      }
    };

    void loadInvitation();

    return () => {
      isActive = false;
    };
  }, [form, invitationHash]);

  const submit = async (values: InvitationFormValues) => {
    if (!invitationHash || loadState.status !== "ready") {
      return;
    }

    setSubmitResult({
      hash: invitationHash,
      state: { status: "submitting" },
    });

    try {
      const response = await workspaceMembersApi.register(invitationHash, {
        first_name: values.firstName.trim(),
        last_name: values.lastName.trim(),
        password: values.password,
      });

      setSubmitResult({
        hash: invitationHash,
        state: response.registered
          ? { status: "success" }
          : { status: "error" },
      });
    } catch (error) {
      setSubmitResult({
        hash: invitationHash,
        state: {
          status: "error",
          error,
        },
      });
    }
  };

  return {
    form,
    loadState,
    submitState,
    submit,
  };
};
