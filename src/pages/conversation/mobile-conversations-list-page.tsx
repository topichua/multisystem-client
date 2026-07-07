import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { CenteredSpinner } from "@/components/loading/centered-spinner";
import { useConversationGroupsStore } from "@/features/conversation-groups/model/use-conversation-groups-store";
import { useEnsureConversationGroupsLoaded } from "@/features/conversation-groups/model/use-ensure-conversation-groups-loaded";
import { useConversationsStore } from "@/features/conversations/model/use-conversations-store";
import { BRAND_PRIMARY } from "@/styled/brand";

import { Conversation } from "./conversation-list";
import * as S from "./mobile-conversations-list-page.styled";

const MobileConversationGroupFilters = observer(() => {
  const { t } = useTranslation();
  useEnsureConversationGroupsLoaded();

  const groupsStore = useConversationGroupsStore();
  const conversationsStore = useConversationsStore();

  const sortedGroups = useMemo(
    () => [...groupsStore.groups].sort((a, b) => a.sortOrder - b.sortOrder),
    [groupsStore.groups],
  );

  const selectedGroupId =
    conversationsStore.conversationListGroupFilterIds[0] ?? null;
  const showInitialLoader =
    groupsStore.listLoading && sortedGroups.length === 0;

  const handleSelectGroup = (groupId: number | null) => {
    conversationsStore.setConversationListGroupFilterIds(
      groupId === null ? [] : [groupId],
    );
  };

  if (showInitialLoader) {
    return <CenteredSpinner minHeight={44} />;
  }

  return (
    <S.GroupChipsScroll>
      <S.GroupChips>
        <S.GroupChip
          type="button"
          $selected={selectedGroupId === null}
          aria-pressed={selectedGroupId === null}
          data-qa="conversations-mobile-group-filter-all"
          onClick={() => handleSelectGroup(null)}
        >
          <S.GroupDot $color={BRAND_PRIMARY} aria-hidden="true" />
          <S.GroupName>{t("groups.allConversations")}</S.GroupName>
          <S.GroupCount>{groupsStore.totalConversations}</S.GroupCount>
        </S.GroupChip>

        {sortedGroups.map((group) => (
          <S.GroupChip
            key={group.id}
            type="button"
            $selected={selectedGroupId === group.id}
            aria-pressed={selectedGroupId === group.id}
            data-qa={`conversations-mobile-group-filter-${group.id}`}
            onClick={() => handleSelectGroup(group.id)}
          >
            <S.GroupDot $color={group.color} aria-hidden="true" />
            <S.GroupName>{group.name}</S.GroupName>
            <S.GroupCount>{group.counter}</S.GroupCount>
          </S.GroupChip>
        ))}
      </S.GroupChips>
    </S.GroupChipsScroll>
  );
});

export const MobileConversationsListPage = () => (
  <S.Root>
    <Conversation
      variant="mobile"
      listHeaderSlot={<MobileConversationGroupFilters />}
    />
  </S.Root>
);
