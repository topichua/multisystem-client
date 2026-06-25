import {
  Alert,
  Button,
  Flex,
  Form,
  message,
  Popconfirm,
  Typography,
} from "antd";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { getSettingsGroupPath, pagesMap } from "@/app/router/pages-map";
import type { ConversationGroupWritePayload } from "@/features/conversation-groups/model/conversation-group.types";
import { useConversationGroupsStore } from "@/features/conversation-groups/model/use-conversation-groups-store";

import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import { CenteredSpinner } from "@/components/loading/centered-spinner";
import * as S from "@/components/layout/form-card.styled";

import { GroupFormFields, type GroupFormValues } from "./group-form-fields";

const { Title, Text } = Typography;

export const SettingsGroupDetailView = observer(() => {
  const { t } = useTranslation();
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const store = useConversationGroupsStore();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm<GroupFormValues>();

  const idNum = groupId != null ? Number(groupId) : NaN;

  const group = useMemo(
    () =>
      Number.isFinite(idNum)
        ? store.groups.find((g) => g.id === idNum)
        : undefined,
    [store.groups, idNum],
  );

  useEffect(() => {
    if (group) {
      form.setFieldsValue({
        name: group.name,
        description: group.description,
        color: group.color,
      });
    }
  }, [form, group]);

  const pickNavigateAfterDelete = useCallback(() => {
    const sorted = [...store.groups].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex((g) => g.id === idNum);
    const next = sorted[idx + 1] ?? sorted[idx - 1];
    if (next) {
      navigate(getSettingsGroupPath(next.id));
    } else {
      navigate(pagesMap.settingsGroups);
    }
  }, [idNum, navigate, store.groups]);

  const handleSave = useCallback(async () => {
    if (!group) return;

    let values: GroupFormValues;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    const payload: ConversationGroupWritePayload = {
      name: values.name,
      description: values.description,
      color:
        typeof values.color === "string" ? values.color : String(values.color),
      sort_order: group.sortOrder,
    };

    try {
      await store.updateGroup(group.id, payload);
      messageApi.success(t("groups.updated"));
    } catch (e) {
      messageApi.error(getApiErrorMessage(e, t("groups.updateError")));
    }
  }, [form, group, messageApi, store, t]);

  const handleDelete = useCallback(async () => {
    if (!group) return;
    try {
      await store.deleteGroup(group.id);
      messageApi.success(t("groups.deleted"));
      pickNavigateAfterDelete();
    } catch (e) {
      messageApi.error(getApiErrorMessage(e, t("groups.deleteError")));
    }
  }, [group, messageApi, pickNavigateAfterDelete, store, t]);

  if (!Number.isFinite(idNum)) {
    return <Alert type="error" title={t("groups.invalidGroup")} showIcon />;
  }

  if (store.listLoading && !group) {
    return <CenteredSpinner />;
  }

  if (!store.listLoading && !group) {
    return (
      <Alert
        type="warning"
        title={t("groups.notFoundTitle")}
        description={t("groups.notFoundDescription")}
        showIcon
        action={
          <Button
            size="small"
            onClick={() => navigate(pagesMap.settingsGroups)}
          >
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
      {contextHolder}
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
          <S.FormCard>
            <Form form={form} layout="vertical" onFinish={handleSave}>
              <GroupFormFields
                groups={store.groups}
                editingGroupId={group.id}
              />
            </Form>
          </S.FormCard>
        </PaneDetailLayout.Body>
      </PaneDetailLayout.Root>
    </>
  );
});
