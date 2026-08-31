import { ArchiveIcon, WarningIcon } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { Select, Space } from "antd";
import { observer } from "mobx-react-lite";
import { useCallback, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import {
  GroupColoredNameTag,
  GroupColorSwatch,
  GroupIconMark,
  GroupOptionDivider,
  GroupOptionWithSwatch,
} from "@/features/conversation-groups/components/group-select-visuals";
import {
  type GroupSelectOptionData,
  toGroupSelectOptions,
} from "@/features/conversation-groups/group-select-options";
import type { FooterSystemGroupKey } from "@/features/conversation-groups/model/system-groups";
import { useEnsureConversationGroupsLoaded } from "@/features/conversation-groups/model/use-ensure-conversation-groups-loaded";
import { useConversationGroupsStore } from "@/features/conversation-groups/model/use-conversation-groups-store";
import { useConversationsStore } from "@/features/conversations/model/use-conversations-store";
import { useNotification } from "@/shared/components/notification/use-notification";
import { useIsMobileViewport } from "@/utils/use-media-query";

const footerSystemGroupIcons: Record<FooterSystemGroupKey, Icon> = {
  archived: ArchiveIcon,
  spam: WarningIcon,
};

type ConversationGroupSelectProps = {
  conversationId: string | undefined;
  groupId: number | null;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  showPlainLabels?: boolean;
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;
};

export const ConversationGroupSelect = observer(
  ({
    conversationId,
    groupId,
    disabled,
    className,
    style,
    showPlainLabels = false,
    getPopupContainer,
  }: ConversationGroupSelectProps) => {
    const { t } = useTranslation();
    useEnsureConversationGroupsLoaded();

    const groupsStore = useConversationGroupsStore();
    const conversationsStore = useConversationsStore();
    const notification = useNotification();
    const [saving, setSaving] = useState(false);
    const isMobileViewport = useIsMobileViewport();

    const options = useMemo(
      () => toGroupSelectOptions(groupsStore.groups, t),
      [groupsStore.groups, t],
    );
    const selectOptions = useMemo(() => {
      const regularOptions = options.filter(
        (option) => !option.footerSystemKey,
      );
      const footerSystemOptions = options.filter(
        (option) => option.footerSystemKey,
      );

      if (footerSystemOptions.length === 0) {
        return regularOptions;
      }

      return [
        ...regularOptions,
        {
          label: <GroupOptionDivider />,
          options: footerSystemOptions,
        },
      ];
    }, [options]);

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
          await groupsStore.loadGroups({
            silent: true,
            includeDistribution: true,
          });
        } catch (e) {
          notification.error({
            title: getApiErrorMessage(
              e,
              t("groups.updateConversationGroupError"),
            ),
          });
        } finally {
          setSaving(false);
        }
      },
      [
        conversationId,
        conversationsStore,
        groupId,
        groupsStore,
        notification,
        t,
      ],
    );

    const selectDisabled = disabled || !conversationId || saving;
    const loading = groupsStore.listLoading && groupsStore.groups.length === 0;

    return (
      <>
        <Select
          variant={isMobileViewport ? "outlined" : "borderless"}
          data-qa="layout-conversation-details-group-select"
          className={className}
          style={{ height: 35, ...style }}
          allowClear
          placeholder={t("conversation.groupSelectPlaceholder")}
          loading={loading}
          disabled={selectDisabled}
          value={groupId === null ? undefined : groupId}
          options={selectOptions}
          styles={{
            popup: {
              listItem: {
                paddingInlineStart: 12,
              },
            },
          }}
          optionRender={(option) => {
            const data = option.data as GroupSelectOptionData;

            return (
              <GroupOptionWithSwatch
                label={data.label}
                color={data.color}
                icon={
                  data.footerSystemKey
                    ? footerSystemGroupIcons[data.footerSystemKey]
                    : undefined
                }
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

            const footerSystemKey = options.find(
              (option) => option.value === id,
            )?.footerSystemKey;

            if (footerSystemKey) {
              return (
                <Space size={8} align="center">
                  <GroupIconMark
                    icon={footerSystemGroupIcons[footerSystemKey]}
                  />
                  {g.name}
                </Space>
              );
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
          getPopupContainer={getPopupContainer}
          showSearch={{ optionFilterProp: "label" }}
        />
      </>
    );
  },
);
