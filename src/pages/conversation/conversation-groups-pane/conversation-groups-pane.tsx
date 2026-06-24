import {
  CaretDoubleLeftIcon,
  CaretDoubleRightIcon,
} from "@phosphor-icons/react";
import { Empty, Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

import { useConversationGroupsStore } from "@/features/conversation-groups/model/use-conversation-groups-store";
import { useEnsureConversationGroupsLoaded } from "@/features/conversation-groups/model/use-ensure-conversation-groups-loaded";
import { useConversationsStore } from "@/features/conversations/model/use-conversations-store";
import { BRAND_PRIMARY } from "@/styled/brand";

import { ConversationGroupFilterRow } from "./conversation-group-filter-row";
import * as S from "./conversation-groups-pane.styled";

const { Text, Title } = Typography;

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

    const sortedGroups = [...groupsStore.groups].sort(
      (firstGroup, secondGroup) => firstGroup.sortOrder - secondGroup.sortOrder,
    );

    const selectedGroupId =
      conversationsStore.conversationListGroupFilterIds[0] ?? null;

    const totalGroupsCounter = sortedGroups.reduce(
      (total, group) => total + group.counter,
      0,
    );

    const isInitialLoading =
      groupsStore.listLoading && sortedGroups.length === 0;

    const handleSelectGroup = (groupId: number | null): void => {
      conversationsStore.setConversationListGroupFilterIds(
        groupId === null ? [] : [groupId],
      );
    };

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
          {!isInitialLoading && (
            <S.GroupList>
              <ConversationGroupFilterRow
                color={BRAND_PRIMARY}
                count={totalGroupsCounter}
                name={t("groups.allConversations")}
                selected={selectedGroupId === null}
                onClick={() => handleSelectGroup(null)}
              />

              {sortedGroups.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={t("groups.noGroupsEmpty")}
                  style={{ marginTop: 16 }}
                />
              ) : (
                sortedGroups.map((group) => (
                  <ConversationGroupFilterRow
                    key={group.id}
                    color={group.color}
                    count={group.counter}
                    name={group.name}
                    selected={selectedGroupId === group.id}
                    onClick={() => handleSelectGroup(group.id)}
                  />
                ))
              )}
            </S.GroupList>
          )}
        </S.GroupsScroll>
      </S.Aside>
    );
  },
);
