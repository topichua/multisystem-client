import { Checkbox, Empty } from 'antd';
import { observer } from 'mobx-react-lite';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  PaneScrollRegion,
  PaneSectionHeader,
  PaneSectionHint,
  PaneSectionTitle,
} from '@/components/layout/pane-frame';
import { GroupListLabelRow } from '@/features/conversation-groups/components/group-list-label-row';
import { useEnsureConversationGroupsLoaded } from '@/features/conversation-groups/model/use-ensure-conversation-groups-loaded';
import { useConversationGroupsStore } from '@/features/conversation-groups/model/use-conversation-groups-store';
import { useConversationsStore } from '@/features/conversations/model/use-conversations-store';

import { isClickInsideAntCheckboxWrapper, toggleIdInNumberList } from './group-filter-row';
import * as S from './conversation-groups-pane.styled';

export const ConversationGroupsPane = observer(() => {
  const { t } = useTranslation();
  useEnsureConversationGroupsLoaded();

  const groupsStore = useConversationGroupsStore();
  const conversationsStore = useConversationsStore();

  const sortedGroups = useMemo(
    () => [...groupsStore.groups].sort((a, b) => a.sortOrder - b.sortOrder),
    [groupsStore.groups],
  );

  const filterIds = conversationsStore.conversationListGroupFilterIds;

  const loading = groupsStore.listLoading && sortedGroups.length === 0;

  return (
    <S.Aside aria-label={t('groups.conversationGroupsFilterAria')}>
      <PaneSectionHeader data-qa="layout-conversations-groups-header">
        <PaneSectionTitle>{t('groups.groupsPaneTitle')}</PaneSectionTitle>
        <PaneSectionHint>{t('groups.groupsPaneHint')}</PaneSectionHint>
      </PaneSectionHeader>
      <PaneScrollRegion data-qa="layout-conversations-groups-scroll">
        {loading ? null : sortedGroups.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t('groups.noGroupsEmpty')}
            style={{ marginTop: 16 }}
          />
        ) : (
          <Checkbox.Group
            value={filterIds}
            onChange={(vals) => {
              conversationsStore.setConversationListGroupFilterIds(vals as number[]);
            }}
            style={{ display: 'flex', flexDirection: 'column', width: '100%' }}
          >
            {sortedGroups.map((g) => (
              <S.GroupFilterCheckboxRow
                key={g.id}
                $selected={filterIds.includes(g.id)}
                onClick={(e) => {
                  if (isClickInsideAntCheckboxWrapper(e)) return;
                  conversationsStore.setConversationListGroupFilterIds(
                    toggleIdInNumberList(conversationsStore.conversationListGroupFilterIds, g.id),
                  );
                }}
              >
                <Checkbox value={g.id}>
                  <GroupListLabelRow name={g.name} color={g.color} />
                </Checkbox>
              </S.GroupFilterCheckboxRow>
            ))}
          </Checkbox.Group>
        )}
      </PaneScrollRegion>
    </S.Aside>
  );
});
