import { UserIcon } from '@phosphor-icons/react';
import { Button, Form, Input, Typography } from 'antd';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';

import { ClientPhoneFormInput } from '@/components/client-phone-form-input';
import { PaneDetailLayout } from '@/components/layout/pane-detail-layout';
import { PaneSectionHint } from '@/components/layout/pane-frame';
import type { AuthUserRole } from '@/features/auth/model/auth-session.types';
import { useUserStore } from '@/features/auth/model/use-user-store';

import * as S from './settings-user-view.styled';

const { Title } = Typography;

type UserSettingsFormValues = {
  fullName: string;
  phone?: string;
  email: string;
};

function getInitials(value: string | null): string | undefined {
  const source = value?.trim();
  if (!source) {
    return undefined;
  }

  const parts = source.split(/\s+/).filter(Boolean);
  const letters =
    parts.length > 1
      ? `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`
      : source.slice(0, 2);

  return letters.toUpperCase();
}

function getRoleLabel(t: TFunction, role: AuthUserRole | null): string {
  if (!role) {
    return '';
  }

  const key = `userSettings.roles.${role}`;
  return t(key, { defaultValue: role });
}

function getPhoneFromMetadata(
  metadata: Record<string, unknown> | undefined,
): string {
  const phone = metadata?.phone;
  return typeof phone === 'string' ? phone : '';
}

export const SettingsUserView = observer(() => {
  const { t } = useTranslation();
  const userStore = useUserStore();
  const [form] = Form.useForm<UserSettingsFormValues>();

  const displayName = userStore.displayName ?? t('profile.user');
  const initials = getInitials(displayName);
  const companyName = userStore.company?.name;
  const roleLabel = getRoleLabel(t, userStore.role);
  const profileSubtitle = companyName
    ? t('userSettings.profileSubtitle', {
        role: roleLabel,
        company: companyName,
      })
    : roleLabel;

  useEffect(() => {
    const user = userStore.user;
    if (!user) {
      return;
    }

    form.setFieldsValue({
      fullName: displayName,
      phone: getPhoneFromMetadata(user.metadata),
      email: user.email,
    });
  }, [displayName, form, userStore.user]);

  return (
    <PaneDetailLayout.Root inset data-qa="layout-settings-user">
      <PaneDetailLayout.Header data-qa="layout-settings-user-header">
        <Title level={4} style={{ marginTop: 0 }}>
          {t('userSettings.title')}
        </Title>
        <PaneSectionHint style={{ marginTop: 0 }}>
          {t('userSettings.subtitle')}
        </PaneSectionHint>
      </PaneDetailLayout.Header>
      <PaneDetailLayout.Body data-qa="layout-settings-user-body">
        <S.FormCard>
          <S.ProfileRow>
            <S.ProfileIdentity>
              <S.ProfileAvatar
                size={56}
                icon={initials ? undefined : <UserIcon />}
              >
                {initials}
              </S.ProfileAvatar>
              <S.ProfileText>
                <S.ProfileName>{displayName}</S.ProfileName>
                {profileSubtitle ? (
                  <S.ProfileSubtitle>{profileSubtitle}</S.ProfileSubtitle>
                ) : null}
              </S.ProfileText>
            </S.ProfileIdentity>
            <Button>{t('userSettings.changePhoto')}</Button>
          </S.ProfileRow>

          <S.FormDivider />

          <Form form={form} layout="vertical" requiredMark={false}>
            <S.FormGrid>
              <Form.Item name="fullName" label={t('userSettings.fullName')}>
                <Input autoComplete="name" />
              </Form.Item>
              <Form.Item name="email" label={t('userSettings.email')}>
                <Input autoComplete="email" />
              </Form.Item>
              <Form.Item name="phone" label={t('userSettings.phone')}>
                <ClientPhoneFormInput
                  autoComplete="tel"
                  placeholder={t('userSettings.phonePlaceholder')}
                />
              </Form.Item>
              <Form.Item label={t('userSettings.role')}>
                <Input disabled value={roleLabel} />
              </Form.Item>
            </S.FormGrid>
          </Form>

          <S.FormDivider />

          <S.FormFooter>
            <Button type="primary">{t('userSettings.saveChanges')}</Button>
          </S.FormFooter>
        </S.FormCard>
      </PaneDetailLayout.Body>
    </PaneDetailLayout.Root>
  );
});
