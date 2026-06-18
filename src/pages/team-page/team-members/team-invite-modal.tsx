import { CheckIcon, EnvelopeSimpleIcon } from "@phosphor-icons/react";
import { Button, Flex, Form, Input, Modal, Spin, Typography } from "antd";
import type { FormInstance } from "antd/es/form";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { WorkspaceRole } from "@/features/workspace-roles/model/workspace-role.types";
import { DEFAULT_COLOR_PRESET } from "@/shared/components/preset-color-picker/color-presets";

import * as S from "./team-invite-modal.styled";

const { Text } = Typography;

export type TeamInviteFormValues = {
  email: string;
  roleId: number;
};

type TeamInviteModalProps = {
  open: boolean;
  form: FormInstance<TeamInviteFormValues>;
  inviteLoading: boolean;
  roles: WorkspaceRole[];
  rolesLoading: boolean;
  onCancel: () => void;
  onSubmit: () => Promise<void>;
};

export const TeamInviteModal = ({
  open,
  form,
  inviteLoading,
  roles,
  rolesLoading,
  onCancel,
  onSubmit,
}: TeamInviteModalProps) => {
  const { t } = useTranslation();
  const selectedRoleId = Form.useWatch("roleId", form);
  const roleOptions = useMemo(
    () => [...roles].sort((a, b) => a.id - b.id),
    [roles],
  );

  useEffect(() => {
    if (!open || selectedRoleId !== undefined || roleOptions.length === 0) {
      return;
    }

    form.setFieldValue("roleId", roleOptions[0].id);
  }, [form, open, roleOptions, selectedRoleId]);

  return (
    <Modal
      title={t("team.invite.title")}
      open={open}
      onCancel={onCancel}
      footer={null}
      destroyOnHidden
      width={520}
    >
      <S.ModalDescription>{t("team.invite.description")}</S.ModalDescription>

      <Form
        form={form}
        layout="vertical"
        requiredMark
        onFinish={() => void onSubmit()}
        initialValues={{
          email: "",
        }}
      >
        <Form.Item
          name="email"
          label={t("team.invite.email")}
          rules={[
            { required: true, message: t("team.invite.emailRequired") },
            { type: "email", message: t("team.invite.emailInvalid") },
          ]}
        >
          <Input placeholder={t("team.invite.emailPlaceholder")} autoFocus />
        </Form.Item>

        <Form.Item
          name="roleId"
          label={t("team.invite.role")}
          rules={[{ required: true, message: t("team.invite.roleRequired") }]}
        >
          <S.RoleOptionList
            role="radiogroup"
            aria-label={t("team.invite.role")}
          >
            {rolesLoading ? (
              <Spin size="small" />
            ) : (
              roleOptions.map((role) => {
                const selected = selectedRoleId === role.id;

                return (
                  <S.RoleOptionCard
                    key={role.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    $selected={selected}
                    onClick={() => form.setFieldValue("roleId", role.id)}
                  >
                    <S.RoleOptionDot
                      color={role.color ?? DEFAULT_COLOR_PRESET}
                    />
                    <S.RoleOptionContent>
                      <Text strong>{role.name}</Text>
                      {role.description ? (
                        <>
                          <br />
                          <Text type="secondary">{role.description}</Text>
                        </>
                      ) : null}
                    </S.RoleOptionContent>
                    <S.RoleCheck $selected={selected}>
                      {selected ? <CheckIcon size={12} weight="bold" /> : null}
                    </S.RoleCheck>
                  </S.RoleOptionCard>
                );
              })
            )}
          </S.RoleOptionList>
        </Form.Item>

        <S.ModalFooter>
          <Button onClick={onCancel}>{t("team.invite.cancel")}</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={inviteLoading}
            disabled={rolesLoading || roleOptions.length === 0}
          >
            <Flex align="center" gap={8} justify="center">
              <EnvelopeSimpleIcon size={16} />
              {t("team.invite.submit")}
            </Flex>
          </Button>
        </S.ModalFooter>
      </Form>
    </Modal>
  );
};
