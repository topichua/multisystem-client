import * as S from "./conversation-groups-pane.styled";

type ConversationGroupFilterRowProps = {
  color: string;
  count: number;
  name: string;
  selected: boolean;
  onClick: () => void;
};

export const ConversationGroupFilterRow = ({
  color,
  count,
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
      <S.GroupDot $color={color} />
      <S.GroupName>{name}</S.GroupName>
    </S.GroupIdentity>

    <S.GroupCount>{count}</S.GroupCount>
  </S.GroupFilterRow>
);
