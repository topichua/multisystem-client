import { ListChecksIcon, TextTIcon } from "@phosphor-icons/react";
import { Tag } from "antd";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

import type { CharacteristicFieldType } from "@/features/characteristics/model/characteristic.types";

const TypeTag = styled(Tag)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-inline-end: 0;
  border-color: ${({ theme }) => theme.colors.functional.border.primary};
  color: ${({ theme }) => theme.colors.functional.text.primary};
  background: ${({ theme }) => theme.colors.functional.background.active};

  svg {
    color: ${({ theme }) => theme.colors.semantic.primary};
  }
`;

type CharacteristicTypeTagProps = {
  type: CharacteristicFieldType;
};

export const CharacteristicTypeTag = ({ type }: CharacteristicTypeTagProps) => {
  const { t } = useTranslation();
  const Icon = type === "options" ? ListChecksIcon : TextTIcon;

  return (
    <TypeTag>
      <Icon size={16} />
      {type === "options"
        ? t("characteristics.typeOptions")
        : t("characteristics.typeText")}
    </TypeTag>
  );
};
