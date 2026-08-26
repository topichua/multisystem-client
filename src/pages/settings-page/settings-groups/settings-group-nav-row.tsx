import type { Icon } from "@phosphor-icons/react";

import * as S from "./settings-groups-layout.styled";
import { Flex, Typography } from "antd";
import { t } from "i18next";

const { Text } = Typography;

type SettingsGroupNavRowProps = {
  name: string;
  count: number;
  isSystem?: boolean;
  color?: string;
  icon?: Icon;
  selected?: boolean;
  dataQa?: string;
  onClick?: () => void;
};

export const SettingsGroupNavRow = ({
  name,
  count,
  isSystem = false,
  color,
  icon: IconComponent,
  selected = false,
  dataQa,
  onClick,
}: SettingsGroupNavRowProps) => {
  const identity = (
    <S.GroupIdentity>
      {IconComponent ? (
        <S.GroupIcon aria-hidden="true">
          <IconComponent size={16} />
        </S.GroupIcon>
      ) : (
        <S.GroupDot $color={color || "transparent"} aria-hidden="true" />
      )}
      <Flex gap={2} vertical>
        <S.GroupName>{name}</S.GroupName>
        <Text
          type="secondary"
          style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}
        >
          {isSystem && t("groups.systemBadge")}
        </Text>
      </Flex>
    </S.GroupIdentity>
  );

  const countBadge = <S.GroupCount>{count}</S.GroupCount>;

  if (onClick == null) {
    return (
      <S.GroupStaticRow data-qa={dataQa}>
        {identity}
        {countBadge}
      </S.GroupStaticRow>
    );
  }

  return (
    <S.GroupNavButton
      type="button"
      $selected={selected}
      data-qa={dataQa}
      aria-current={selected ? "page" : undefined}
      onClick={onClick}
    >
      {identity}
      {countBadge}
    </S.GroupNavButton>
  );
};
