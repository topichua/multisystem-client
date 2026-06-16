import { CheckIcon, EnvelopeSimpleIcon } from "@phosphor-icons/react";
import { Button, Flex, Form, Input, Modal, Typography } from "antd";
import type { FormInstance } from "antd/es/form";
import { useTranslation } from "react-i18next";

import {
  INVITE_ROLE_SLUGS,
  type InviteRoleSlug,
} from "@/features/workspace-members/model/workspace-member.types";

import * as S from "./team-invite-modal.styled";

const { Text } = Typography;

export type TeamInviteFormValues = {
  email: string;
  roleSlug: InviteRoleSlug;
};

type TeamInviteModalProps = {
  open: boolean;
  form: FormInstance<TeamInviteFormValues>;
  inviteLoading: boolean;
  onCancel: () => void;
  onSubmit: () => Promise<void>;
};

export const TeamInviteModal = ({
  open,
  form,
  inviteLoading,
  onCancel,
  onSubmit,
}: TeamInviteModalProps) => {
  const { t } = useTranslation();
  const selectedRoleSlug = Form.useWatch("roleSlug", form) ?? "manager";

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
          roleSlug: "manager" satisfies InviteRoleSlug,
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
          name="roleSlug"
          label={t("team.invite.role")}
          rules={[{ required: true, message: t("team.invite.roleRequired") }]}
        >
          <S.RoleOptionList
            role="radiogroup"
            aria-label={t("team.invite.role")}
          >
            {INVITE_ROLE_SLUGS.map((slug) => {
              const selected = selectedRoleSlug === slug;

              return (
                <S.RoleOptionCard
                  key={slug}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  $selected={selected}
                  onClick={() => form.setFieldValue("roleSlug", slug)}
                >
                  <S.RoleDot $color={S.ROLE_DOT_COLORS[slug]} />
                  <S.RoleOptionContent>
                    <Text strong>{t(`team.invite.roles.${slug}.title`)}</Text>
                    <br />
                    <Text type="secondary">
                      {t(`team.invite.roles.${slug}.description`)}
                    </Text>
                  </S.RoleOptionContent>
                  <S.RoleCheck $selected={selected}>
                    {selected ? <CheckIcon size={12} weight="bold" /> : null}
                  </S.RoleCheck>
                </S.RoleOptionCard>
              );
            })}
          </S.RoleOptionList>
        </Form.Item>

        <S.ModalFooter>
          <Button onClick={onCancel}>{t("team.invite.cancel")}</Button>
          <Button type="primary" htmlType="submit" loading={inviteLoading}>
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
