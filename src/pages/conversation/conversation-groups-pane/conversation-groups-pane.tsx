import {
  ArchiveIcon,
  CaretDoubleLeftIcon,
  CaretDoubleRightIcon,
  ClockIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { Empty, Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

import { CenteredSpinner } from "@/components/loading/centered-spinner";
import type { ConversationGroup } from "@/features/conversation-groups/model/conversation-group.types";
import {
  type FollowUpSystemGroupKey,
  type FooterSystemGroupKey,
  getConversationGroupDisplayName,
  partitionConversationGroups,
} from "@/features/conversation-groups/model/system-groups";
import { useConversationGroupsStore } from "@/features/conversation-groups/model/use-conversation-groups-store";
import { useEnsureConversationGroupsLoaded } from "@/features/conversation-groups/model/use-ensure-conversation-groups-loaded";
import { useConversationsStore } from "@/features/conversations/model/use-conversations-store";
import { BRAND_PRIMARY } from "@/styled/brand";

import { ConversationGroupFilterRow } from "./conversation-group-filter-row";
import * as S from "./conversation-groups-pane.styled";

const { Text, Title } = Typography;

const followUpSystemGroupIcons: Record<FollowUpSystemGroupKey, Icon> = {
  pending_follow_up: ClockIcon,
};

const footerSystemGroupIcons: Record<FooterSystemGroupKey, Icon> = {
  archived: ArchiveIcon,
  spam: WarningIcon,
};

type ConversationGroupsPaneProps = {
  collapsed: boolean;
  onCollapse: () => void;
  onExpand: () => void;
};

export const ConversationGroupsPane = observer(
  ({ collapsed, onCollapse, onExpand }: ConversationGroupsPaneProps) => {
    const { t } = useTranslation();

    useEnsureConversationGroupsLoaded();

    const groupsStore = useConversationGroupsStore();
    const conversationsStore = useConversationsStore();

    const { regularGroups, followUpSystemGroups, footerSystemGroups } =
      partitionConversationGroups(groupsStore.groups);
    const hasGroups = groupsStore.groups.length > 0;

    const selectedGroupId =
      conversationsStore.conversationListGroupFilterIds[0] ?? null;

    const isInitialLoading = groupsStore.listLoading && !hasGroups;

    const handleSelectGroup = (groupId: number | null): void => {
      conversationsStore.setConversationListGroupFilterIds(
        groupId === null ? [] : [groupId],
      );
    };

    const renderSystemGroups = <K extends string>(
      groups: Array<ConversationGroup & { systemKey: K }>,
      icons: Record<K, Icon>,
    ) =>
      groups.length === 0 ? null : (
        <>
          <S.GroupListDivider />
          {groups.map((group) => (
            <ConversationGroupFilterRow
              key={group.id}
              count={group.counter}
              icon={icons[group.systemKey]}
              name={getConversationGroupDisplayName(group, t)}
              selected={selectedGroupId === group.id}
              onClick={() => handleSelectGroup(group.id)}
            />
          ))}
        </>
      );

    if (collapsed) {
      return (
        <S.CollapsedAside aria-label={t("groups.conversationGroupsFilterAria")}>
          <S.ExpandButton
            type="button"
            aria-label={t("groups.expandGroupsPaneAria")}
            onClick={onExpand}
          >
            <CaretDoubleRightIcon size={16} weight="bold" />
          </S.ExpandButton>
          <S.CollapsedLabel>{t("groups.groupsPaneTitle")}</S.CollapsedLabel>
        </S.CollapsedAside>
      );
    }

    return (
      <S.Aside aria-label={t("groups.conversationGroupsFilterAria")}>
        <S.Header data-qa="layout-conversations-groups-header">
          <S.HeaderTop>
            <Title level={4}>{t("groups.groupsPaneTitle")}</Title>

            <S.CollapseButton
              type="button"
              aria-label={t("groups.collapseGroupsPaneAria")}
              onClick={onCollapse}
            >
              <CaretDoubleLeftIcon size={16} weight="bold" />
            </S.CollapseButton>
          </S.HeaderTop>

          <Text type="secondary">{t("groups.groupsPaneHint")}</Text>
        </S.Header>

        <S.GroupsScroll data-qa="layout-conversations-groups-scroll">
          {isInitialLoading ? (
            <CenteredSpinner minHeight={160} />
          ) : (
            <S.GroupList>
              <ConversationGroupFilterRow
                color={BRAND_PRIMARY}
                count={groupsStore.totalConversations}
                name={t("groups.allConversations")}
                selected={selectedGroupId === null}
                onClick={() => handleSelectGroup(null)}
              />

              {!hasGroups ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={t("groups.noGroupsEmpty")}
                  style={{ marginTop: 16 }}
                />
              ) : (
                <>
                  {regularGroups.map((group) => (
                    <ConversationGroupFilterRow
                      key={group.id}
                      color={group.color}
                      count={group.counter}
                      name={getConversationGroupDisplayName(group, t)}
                      selected={selectedGroupId === group.id}
                      onClick={() => handleSelectGroup(group.id)}
                    />
                  ))}

                  {renderSystemGroups(
                    followUpSystemGroups,
                    followUpSystemGroupIcons,
                  )}
                  {renderSystemGroups(footerSystemGroups, footerSystemGroupIcons)}
                </>
              )}
            </S.GroupList>
          )}
        </S.GroupsScroll>
      </S.Aside>
    );
  },
);
