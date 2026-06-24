import { message, Select, Space } from "antd";
import { observer } from "mobx-react-lite";
import { useCallback, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import {
  GroupColoredNameTag,
  GroupColorSwatch,
  GroupOptionWithSwatch,
} from "@/features/conversation-groups/components/group-select-visuals";
import {
  type GroupSelectOptionData,
  toGroupSelectOptions,
} from "@/features/conversation-groups/group-select-options";
import { useEnsureConversationGroupsLoaded } from "@/features/conversation-groups/model/use-ensure-conversation-groups-loaded";
import { useConversationGroupsStore } from "@/features/conversation-groups/model/use-conversation-groups-store";
import { useConversationsStore } from "@/features/conversations/model/use-conversations-store";

type ConversationGroupSelectProps = {
  conversationId: string | undefined;
  groupId: number | null;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  showPlainLabels?: boolean;
};

export const ConversationGroupSelect = observer(
  ({
    conversationId,
    groupId,
    disabled,
    className,
    style,
    showPlainLabels = false,
  }: ConversationGroupSelectProps) => {
    const { t } = useTranslation();
    useEnsureConversationGroupsLoaded();

    const groupsStore = useConversationGroupsStore();
    const conversationsStore = useConversationsStore();
    const [messageApi, contextHolder] = message.useMessage();
    const [saving, setSaving] = useState(false);

    const options = useMemo(
      () => toGroupSelectOptions(groupsStore.groups),
      [groupsStore.groups],
    );

    const applyGroup = useCallback(
      async (next: number | null) => {
        if (!conversationId || next === groupId) {
          return;
        }

        setSaving(true);

        try {
          await conversationsStore.updateConversationGroup(
            conversationId,
            next,
          );
        } catch (e) {
          messageApi.error(
            getApiErrorMessage(e, t("groups.updateConversationGroupError")),
          );
        } finally {
          setSaving(false);
        }
      },
      [conversationId, conversationsStore, groupId, messageApi, t],
    );

    const selectDisabled = disabled || !conversationId || saving;
    const loading = groupsStore.listLoading && groupsStore.groups.length === 0;

    return (
      <>
        {contextHolder}
        <Select
          data-qa="layout-conversation-details-group-select"
          className={className}
          style={{ minWidth: 200, height: 35, ...style }}
          allowClear
          placeholder={t("conversation.groupSelectPlaceholder")}
          loading={loading}
          disabled={selectDisabled}
          value={groupId === null ? undefined : groupId}
          options={options}
          optionRender={(option) => {
            const data = option.data as GroupSelectOptionData;

            return (
              <GroupOptionWithSwatch
                label={data.label}
                color={data.color}
                showPlainLabels={showPlainLabels}
              />
            );
          }}
          labelRender={(props) => {
            const id = props.value as number | undefined;

            if (id == null) {
              return (
                <span style={{ color: "rgba(0,0,0,0.45)" }}>
                  {t("conversation.noGroup")}
                </span>
              );
            }

            const g = groupsStore.groups.find((x) => x.id === id);

            if (!g) {
              return String(id);
            }

            return (
              <Space size={8} align="center">
                <GroupColorSwatch color={g.color} />
                {showPlainLabels ? (
                  g.name
                ) : (
                  <GroupColoredNameTag name={g.name} color={g.color} />
                )}
              </Space>
            );
          }}
          onChange={(v) => {
            const next = v === undefined ? null : v;
            void applyGroup(next);
          }}
          popupMatchSelectWidth={false}
          showSearch={{ optionFilterProp: "label" }}
        />
      </>
    );
  },
);
