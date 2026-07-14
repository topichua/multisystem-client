import { ArrowLeftIcon, CheckIcon } from '@phosphor-icons/react';
import { Alert, Button, Flex, Form, Popconfirm, Switch } from 'antd';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';

import { PaneDetailLayout } from '@/components/layout/pane-detail-layout';
import { CenteredSpinner } from '@/components/loading/centered-spinner';

import { AutomationRuleFormFields } from './automation-rule-form';
import { useAutomationEditor } from './use-automation-editor';
import * as S from './settings-automation.styled';

export const SettingsAutomationEditorView = observer(() => {
  const { t } = useTranslation();
  const editor = useAutomationEditor();

  if (editor.isInvalidId) {
    return <Alert type="error" title={t('automation.invalidId')} showIcon />;
  }

  if (editor.isLoading) {
    return <CenteredSpinner />;
  }

  if (editor.isNotFound) {
    return (
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
    );
  }

  return (
    <PaneDetailLayout.Root inset data-qa="layout-settings-automation-editor">
      <Form
        form={editor.form}
        layout="vertical"
        requiredMark
        onFinish={(values) => void editor.handleSubmit(values)}
        style={{ display: 'contents' }}
        data-qa={`settings-automation-${editor.isCreate ? 'create' : 'edit'}-form`}
      >
        <PaneDetailLayout.Header data-qa="layout-settings-automation-editor-header">
          <Flex justify="space-between" align="flex-start" gap={16} wrap="wrap">
            <Flex
              align="center"
              gap={4}
              style={{ minWidth: 0, flex: '1 1 280px' }}
            >
              <Button
                type="text"
                icon={<ArrowLeftIcon size={16} />}
                onClick={editor.navigateToList}
                data-qa="settings-automation-back"
              />
              <S.HeaderTitle level={4}>{editor.title}</S.HeaderTitle>
            </Flex>

            <S.HeaderActions>
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

              {!editor.isCreate && (
                <Popconfirm
                  title={t('automation.deleteConfirmTitle')}
                  okText={t('automation.delete')}
                  okButtonProps={{ danger: true }}
                  onConfirm={() => void editor.handleDelete()}
                >
                  <Button
                    danger
                    loading={editor.deleteLoading}
                    data-qa="settings-automation-delete"
                  >
                    {t('automation.delete')}
                  </Button>
                </Popconfirm>
              )}

              <Button
                type="primary"
                htmlType="submit"
                loading={editor.saveLoading}
                icon={<CheckIcon />}
                data-qa="settings-automation-save"
              >
                {t('automation.save')}
              </Button>
            </S.HeaderActions>
          </Flex>
        </PaneDetailLayout.Header>

        <PaneDetailLayout.Body data-qa="layout-settings-automation-editor-body">
          <AutomationRuleFormFields
            form={editor.form}
            criteria={editor.criteria}
          />
        </PaneDetailLayout.Body>
      </Form>
    </PaneDetailLayout.Root>
  );
});
