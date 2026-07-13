import type { Icon } from '@phosphor-icons/react';

import * as S from './conversation-groups-pane.styled';

type ConversationGroupFilterRowProps = {
  color?: string;
  count: number;
  icon?: Icon;
  name: string;
  selected: boolean;
  onClick: () => void;
};

export const ConversationGroupFilterRow = ({
  color,
  count,
  icon: IconComponent,
  name,
  selected,
  onClick,
}: ConversationGroupFilterRowProps) => (
  <S.GroupFilterRow
    type="button"
    $selected={selected}
    aria-pressed={selected}
    onClick={onClick}
  >
    <S.GroupIdentity>
      {IconComponent ? (
        <S.GroupIcon aria-hidden="true">
          <IconComponent size={16} />
        </S.GroupIcon>
      ) : (
        <S.GroupDot $color={color ?? 'transparent'} aria-hidden="true" />
      )}
      <S.GroupName>{name}</S.GroupName>
    </S.GroupIdentity>

    <S.GroupCount>{count}</S.GroupCount>
  </S.GroupFilterRow>
);
