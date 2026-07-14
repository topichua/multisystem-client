import { Alert, Button, Flex, Form, Popconfirm, Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import { CenteredSpinner } from "@/components/loading/centered-spinner";
import { FormCard } from "@/components/layout/form-card";

import { GroupFormFields } from "./group-form-fields";
import { useSettingsGroupEditor } from "./use-settings-group-editor";

const { Title, Text } = Typography;

export const SettingsGroupDetailView = observer(() => {
  const { t } = useTranslation();
  const { groupId } = useParams<{ groupId: string }>();
  const {
    group,
    form,
    store,
    isInvalidId,
    isLoading,
    isNotFound,
    handleSave,
    handleDelete,
    navigateToGroups,
  } = useSettingsGroupEditor(groupId);

  if (isInvalidId) {
    return <Alert type="error" title={t("groups.invalidGroup")} showIcon />;
  }

  if (isLoading) {
    return <CenteredSpinner />;
  }

  if (isNotFound) {
    return (
      <Alert
        type="warning"
        title={t("groups.notFoundTitle")}
        description={t("groups.notFoundDescription")}
        showIcon
        action={
          <Button size="small" onClick={navigateToGroups}>
            {t("groups.backToGroups")}
          </Button>
        }
      />
    );
  }

  if (!group) {
    return null;
  }

  return (
    <>
      <PaneDetailLayout.Root inset data-qa="layout-settings-group-detail">
        <PaneDetailLayout.Header data-qa="layout-settings-group-detail-header">
          <Flex justify="space-between" align="flex-start" gap={16} wrap="wrap">
            <Flex vertical gap={4}>
              <Title level={4} style={{ margin: 0 }}>
                {group.name}
              </Title>
              <Text type="secondary">{t("groups.editHint")}</Text>
            </Flex>
            <Flex gap={8} align="center" wrap="wrap" style={{ flexShrink: 0 }}>
              <Button
                type="primary"
                loading={store.saveLoading}
                onClick={() => void handleSave()}
              >
                {t("groups.saveChanges")}
              </Button>
              <Popconfirm
                title={t("groups.deleteConfirmTitle")}
                okText={t("groups.delete")}
                okButtonProps={{ danger: true }}
                onConfirm={handleDelete}
              >
                <Button danger loading={store.deleteLoadingId === group.id}>
                  {t("groups.delete")}
                </Button>
              </Popconfirm>
            </Flex>
          </Flex>
        </PaneDetailLayout.Header>
        <PaneDetailLayout.Body data-qa="layout-settings-group-detail-body">
          <FormCard>
            <Form form={form} layout="vertical" onFinish={handleSave}>
              <GroupFormFields
                groups={store.groups}
                editingGroupId={group.id}
              />
            </Form>
          </FormCard>
        </PaneDetailLayout.Body>
      </PaneDetailLayout.Root>
    </>
  );
});
