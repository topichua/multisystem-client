import { InfoIcon } from '@phosphor-icons/react';
import { Avatar, Button, Skeleton, Tooltip, Typography } from 'antd';
import { observer } from 'mobx-react-lite';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { ConversationGroupSelect } from '@/features/conversations/components/conversation-group-select';
import { useConversationsStore } from '@/features/conversations/model/use-conversations-store';

import * as S from './header.styled';

const { Text } = Typography;

type HeaderProps = {
  clientInfoOpen?: boolean;
  onClientInfoToggle?: () => void;
};

export const Header = observer(({ clientInfoOpen, onClientInfoToggle }: HeaderProps) => {
  const { t } = useTranslation();
  const { conversationId } = useParams();
  const { conversations } = useConversationsStore();

  const peer = useMemo(
    () => conversations.find((c) => String(c.id) === conversationId),
    [conversations, conversationId],
  );

  const titleName = peer?.participant.name ?? t('conversation.fallbackTitle');
  const subtitle = peer?.participant.username ? `@${peer.participant.username}` : null;

  return (
    <S.Header>
      {peer ? (
        <Avatar size={40} src={peer.participant.profilePic || undefined}>
          {titleName.slice(0, 1).toUpperCase()}
        </Avatar>
      ) : (
        <Skeleton.Avatar active size={40} />
      )}
      <S.HeaderText>
        {peer ? (
          <>
            <Text strong ellipsis style={{ fontSize: 16, lineHeight: 1.3 }}>
              {titleName}
            </Text>
            {subtitle && (
              <Text type="secondary" ellipsis style={{ fontSize: 13 }}>
                {subtitle}
              </Text>
            )}
          </>
        ) : (
          <>
            <Skeleton.Input active size="small" style={{ width: 160, height: 18 }} />
            <Skeleton.Input active size="small" style={{ width: 120, height: 14 }} />
          </>
        )}
      </S.HeaderText>
      {conversationId ? (
        <S.HeaderAside>
          <ConversationGroupSelect
            conversationId={conversationId}
            groupId={peer?.groupId ?? null}
            disabled={!peer}
          />
          {onClientInfoToggle ? (
            <Tooltip title={t('conversation.clientInfoTooltip')}>
              <Button
                type="text"
                icon={<InfoIcon size={22} />}
                aria-label={t('conversation.clientInfoAria')}
                aria-pressed={clientInfoOpen}
                data-qa="layout-conversation-details-client-info-toggle"
                onClick={onClientInfoToggle}
              />
            </Tooltip>
          ) : null}
        </S.HeaderAside>
      ) : null}
    </S.Header>
  );
});
