import { CheckIcon } from "@phosphor-icons/react";
import { Select } from "antd";
import { observer } from "mobx-react-lite";
import { useCallback, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { ConversationAssigneeSelectOption } from "@/features/conversations/components/conversation-assignee-select-option";
import type { ConversationAssignee } from "@/features/conversations/model/types";
import { useConversationsStore } from "@/features/conversations/model/use-conversations-store";
import { getWorkspaceMemberAssignee } from "@/features/conversations/utils/conversation-assignee";
import type { WorkspaceMember } from "@/features/workspace-members/model/workspace-member.types";
import { useEnsureWorkspaceMembersLoaded } from "@/features/workspace-members/model/use-ensure-workspace-members-loaded";
import { useWorkspaceMembersStore } from "@/features/workspace-members/model/use-workspace-members-store";
import { getWorkspaceMemberName } from "@/features/workspace-members/utils/workspace-member-display";
import { useNotification } from "@/shared/components/notification/use-notification";

const UNASSIGNED_VALUE = "__unassigned__";

type AssigneeSelectValue = number | typeof UNASSIGNED_VALUE;

type AssigneeSelectOption = {
  value: AssigneeSelectValue;
  label: string;
  member?: WorkspaceMember;
};

type ConversationAssigneeSelectProps = {
  conversationId: string | undefined;
  responsibleMemberId: number | null;
  assignee: ConversationAssignee | null;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;
};

export const ConversationAssigneeSelect = observer(
  ({
    conversationId,
    responsibleMemberId,
    assignee,
    disabled,
    className,
    style,
    getPopupContainer,
  }: ConversationAssigneeSelectProps) => {
    const { t } = useTranslation();
    useEnsureWorkspaceMembersLoaded();

    const membersStore = useWorkspaceMembersStore();
    const conversationsStore = useConversationsStore();
    const notification = useNotification();
    const [saving, setSaving] = useState(false);
    const currentAssigneeId = responsibleMemberId ?? assignee?.id ?? null;

    const options = useMemo<AssigneeSelectOption[]>(() => {
      const assignableOptions = membersStore.members
        .filter(
          (member) =>
            member.status === "active" &&
            member.work_status === "accepting_new_chats",
        )
        .map((member) => ({
          value: member.id,
          label: getWorkspaceMemberName(member),
          member,
        }))
        .sort((a, b) =>
          a.label.localeCompare(b.label, undefined, { sensitivity: "base" }),
        );
      const currentMember =
        responsibleMemberId == null
          ? undefined
          : membersStore.members.find(
              (member) => member.id === responsibleMemberId,
            );
      const options =
        currentMember &&
        !assignableOptions.some((option) => option.value === currentMember.id)
          ? [
              ...assignableOptions,
              {
                value: currentMember.id,
                label: getWorkspaceMemberName(currentMember),
                member: currentMember,
              },
            ]
          : assignableOptions;

      return [
        ...options,
        {
          value: UNASSIGNED_VALUE,
          label: t("conversation.noAssignee"),
        },
      ];
    }, [membersStore.members, responsibleMemberId, t]);

    const applyAssignee = useCallback(
      async (next: AssigneeSelectValue) => {
        const responsibleMemberId =
          next === UNASSIGNED_VALUE ? null : Number(next);

        if (!conversationId || responsibleMemberId === currentAssigneeId) {
          return;
        }

        setSaving(true);

        try {
          const member = membersStore.members.find(
            (item) => item.id === responsibleMemberId,
          );

          await conversationsStore.updateConversationAssignee(
            conversationId,
            responsibleMemberId,
            member ? getWorkspaceMemberAssignee(member) : null,
          );
        } catch (e) {
          notification.error({
            title: getApiErrorMessage(e, t("conversation.updateAssigneeError")),
          });
        } finally {
          setSaving(false);
        }
      },
      [
        conversationId,
        conversationsStore,
        currentAssigneeId,
        membersStore.members,
        notification,
        t,
      ],
    );

    const value = currentAssigneeId ?? UNASSIGNED_VALUE;
    const selectDisabled = disabled || !conversationId || saving;
    const loading =
      membersStore.listLoading && membersStore.members.length === 0;

    return (
      <>
        <Select
          data-qa="layout-conversation-details-assignee-select"
          className={className}
          style={{ minWidth: 216, height: 35, ...style }}
          placeholder={t("conversation.assigneeSelectPlaceholder")}
          loading={loading}
          disabled={selectDisabled}
          value={value}
          options={options}
          optionRender={(option) => {
            const data = option.data as AssigneeSelectOption;

            return (
              <ConversationAssigneeSelectOption
                member={data.member}
                label={data.label}
              />
            );
          }}
          labelRender={(props) => {
            const current = options.find(
              (option) => option.value === props.value,
            );

            return (
              <ConversationAssigneeSelectOption
                member={current?.member}
                label={
                  current?.label ??
                  (currentAssigneeId == null
                    ? t("conversation.noAssignee")
                    : `#${currentAssigneeId}`)
                }
              />
            );
          }}
          menuItemSelectedIcon={<CheckIcon size={16} />}
          onChange={(next: AssigneeSelectValue) => {
            void applyAssignee(next);
          }}
          popupMatchSelectWidth={false}
          getPopupContainer={getPopupContainer}
          popupRender={(menu) => (
            <>
              <div
                style={{
                  padding: "8px 12px 4px",
                  color: "rgba(0,0,0,0.45)",
                  fontSize: 11,
                  letterSpacing: 0,
                  textTransform: "uppercase",
                }}
              >
                {t("conversation.assigneeSelectTitle")}
              </div>
              {menu}
            </>
          )}
          showSearch={{ optionFilterProp: "label" }}
        />
      </>
    );
  },
);
