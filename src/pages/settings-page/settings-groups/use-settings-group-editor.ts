import { Form } from "antd";
import { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { getSettingsGroupPath, pagesMap } from "@/app/router/pages-map";
import type { ConversationGroupWritePayload } from "@/features/conversation-groups/model/conversation-group.types";
import { useConversationGroupsStore } from "@/features/conversation-groups/model/use-conversation-groups-store";
import { useNotification } from "@/shared/components/notification/use-notification";

import type { GroupFormValues } from "./group-form-fields";

export function useSettingsGroupEditor(groupId: string | undefined) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const store = useConversationGroupsStore();
  const notification = useNotification();
  const [form] = Form.useForm<GroupFormValues>();

  const idNum = groupId != null ? Number(groupId) : NaN;

  const group = useMemo(
    () =>
      Number.isFinite(idNum)
        ? store.groups.find((item) => item.id === idNum)
        : undefined,
    [idNum, store.groups],
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
    const idx = sorted.findIndex((item) => item.id === idNum);
    const next = sorted[idx + 1] ?? sorted[idx - 1];
    if (next) {
      navigate(getSettingsGroupPath(next.id));
    } else {
      navigate(pagesMap.settingsGroups);
    }
  }, [idNum, navigate, store.groups]);

  const handleSave = useCallback(async () => {
    if (!group) {
      return;
    }

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
      notification.success({ title: t("groups.updated") });
    } catch (e) {
      notification.error({
        title: getApiErrorMessage(e, t("groups.updateError")),
      });
    }
  }, [form, group, notification, store, t]);

  const handleDelete = useCallback(async () => {
    if (!group) {
      return;
    }

    try {
      await store.deleteGroup(group.id);
      notification.success({ title: t("groups.deleted") });
      pickNavigateAfterDelete();
    } catch (e) {
      notification.error({
        title: getApiErrorMessage(e, t("groups.deleteError")),
      });
    }
  }, [group, notification, pickNavigateAfterDelete, store, t]);

  return {
    idNum,
    group,
    form,
    store,
    isInvalidId: !Number.isFinite(idNum),
    isLoading: store.listLoading && !group,
    isNotFound: !store.listLoading && !group,
    handleSave,
    handleDelete,
    navigateToGroups: () => navigate(pagesMap.settingsGroups),
  };
}
