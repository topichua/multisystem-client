import { Typography } from "antd";

import { EMPTY_VALUE } from "../../../utils/order-details.utils";

import type { InfoItem } from "../order-details-content.types";
import * as S from "../order-details-content.styled";

const { Text } = Typography;

type InfoListProps = {
  items: InfoItem[];
};

export const InfoList = ({ items }: InfoListProps) => (
  <S.InfoGrid>
    {items.map((item) => (
      <S.InfoPair key={item.key}>
        <S.InfoLabel>{item.label}</S.InfoLabel>
        <S.InfoValue>{item.value}</S.InfoValue>
      </S.InfoPair>
    ))}
  </S.InfoGrid>
);

type CopyableTextProps = {
  value: string | null | undefined;
};

export const CopyableText = ({ value }: CopyableTextProps) =>
  value ? <Text copyable>{value}</Text> : EMPTY_VALUE;
