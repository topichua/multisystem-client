import { ArrowLeftIcon, CheckIcon } from '@phosphor-icons/react';
import { Alert, Button, Flex, Form, Popconfirm, Switch } from 'antd';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';

import { CenteredSpinner } from '@/components/loading/centered-spinner';
import { dataQaAttrs } from '@/styled/data-qa-attrs';

import * as MobileS from '../mobile-settings-page.styled';
import { AutomationRuleFormFields } from './automation-rule-form';
import { useAutomationEditor } from './use-automation-editor';
import * as S from './settings-automation.styled';

export const MobileSettingsAutomationEditorPage = observer(() => {
  const { t } = useTranslation();
  const editor = useAutomationEditor();

  if (editor.isInvalidId) {
    return (
      <MobileS.Root {...dataQaAttrs('settings-mobile-automation-editor')}>
        <Alert type="error" title={t('automation.invalidId')} showIcon />
      </MobileS.Root>
    );
  }

  if (editor.isLoading) {
    return (
      <MobileS.Root {...dataQaAttrs('settings-mobile-automation-editor')}>
        <CenteredSpinner />
      </MobileS.Root>
    );
  }

  if (editor.isNotFound) {
    return (
      <MobileS.Root {...dataQaAttrs('settings-mobile-automation-editor')}>
        <Alert
          type="warning"
          title={t('automation.notFoundTitle')}
          description={t('automation.notFound')}
          showIcon
          action={
            <Button size="small" onClick={editor.navigateToList}>
              {t('automation.backToList')}
            </Button>
          }
        />
      </MobileS.Root>
    );
  }

  return (
    <MobileS.Root {...dataQaAttrs('settings-mobile-automation-editor')}>
      <Form
        form={editor.form}
        layout="vertical"
        requiredMark
        onFinish={(values) => void editor.handleSubmit(values)}
        style={{ display: 'contents' }}
        data-qa={`settings-automation-${editor.isCreate ? 'create' : 'edit'}-form`}
      >
        <MobileS.PageHeader>
          <MobileS.BackButton
            type="text"
            icon={<ArrowLeftIcon size={16} />}
            onClick={editor.navigateToList}
            data-qa="settings-automation-back"
          >
            {t('automation.backToList')}
          </MobileS.BackButton>

          <MobileS.TitleRow>
            <MobileS.PageTitle level={3}>{editor.title}</MobileS.PageTitle>
          </MobileS.TitleRow>

          <S.MobileEditorActions>
            <Flex align="center" gap={8}>
              <Form.Item
                name="isActive"
                valuePropName="checked"
                style={{ marginBottom: 0 }}
              >
                <Switch data-qa="settings-automation-active-switch" />
              </Form.Item>
              <S.ActiveLabel>{t('automation.active')}</S.ActiveLabel>
            </Flex>

            <Button
              type="primary"
              htmlType="submit"
              loading={editor.saveLoading}
              icon={<CheckIcon />}
              data-qa="settings-automation-save"
            >
              {t('automation.save')}
            </Button>
          </S.MobileEditorActions>
        </MobileS.PageHeader>

        <MobileS.ScrollRegion>
          <MobileS.ContentSection>
            <AutomationRuleFormFields
              form={editor.form}
              criteria={editor.criteria}
            />

            {!editor.isCreate && (
              <MobileS.FooterActions>
                <Popconfirm
                  title={t('automation.deleteConfirmTitle')}
                  okText={t('automation.delete')}
                  okButtonProps={{ danger: true }}
                  onConfirm={() => void editor.handleDelete()}
                >
                  <Button
                    danger
                    block
                    loading={editor.deleteLoading}
                    data-qa="settings-mobile-automation-delete"
                  >
                    {t('automation.delete')}
                  </Button>
                </Popconfirm>
              </MobileS.FooterActions>
            )}
          </MobileS.ContentSection>
        </MobileS.ScrollRegion>
      </Form>
    </MobileS.Root>
  );
});
