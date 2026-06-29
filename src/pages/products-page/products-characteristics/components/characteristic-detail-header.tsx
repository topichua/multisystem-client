import {
  ListChecksIcon,
  PackageIcon,
  PencilSimpleIcon,
  TextTIcon,
} from "@phosphor-icons/react";
import { Button, Flex, Input, Tag, Typography } from "antd";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

import type { CharacteristicBase } from "@/features/characteristics/model/characteristic.types";

import { CHARACTERISTIC_NAME_MAX_LENGTH } from "../products-characteristics.constants";

const { Title } = Typography;

const HeaderMetaTag = styled(Tag)`
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

type CharacteristicLabelEditState = {
  isEditing: boolean;
  value: string;
  onChange: (value: string) => void;
  onOpen: () => void;
  onCancel: () => void;
  onSave: () => Promise<void>;
};

type CharacteristicDetailHeaderProps = {
  characteristic: CharacteristicBase;
  totalProducts: number;
  saveLoading: boolean;
  labelEdit: CharacteristicLabelEditState;
  editDataQa?: string;
};

export const CharacteristicDetailHeader = ({
  characteristic,
  totalProducts,
  saveLoading,
  labelEdit,
  editDataQa,
}: CharacteristicDetailHeaderProps) => {
  const { t } = useTranslation();
  const TypeIcon =
    characteristic.type === "options" ? ListChecksIcon : TextTIcon;

  return (
    <Flex vertical gap={12}>
      {labelEdit.isEditing ? (
        <Flex align="center" gap={8} wrap="wrap">
          <Input
            autoFocus
            value={labelEdit.value}
            maxLength={CHARACTERISTIC_NAME_MAX_LENGTH}
            onChange={(event) => labelEdit.onChange(event.target.value)}
            onPressEnter={() => void labelEdit.onSave()}
            style={{ flex: "1 1 240px", minWidth: 0, maxWidth: 420 }}
          />
          <Button
            type="primary"
            loading={saveLoading}
            onClick={() => void labelEdit.onSave()}
          >
            {t("characteristics.saveChanges")}
          </Button>
          <Button onClick={labelEdit.onCancel}>
            {t("characteristics.cancel")}
          </Button>
        </Flex>
      ) : (
        <Flex align="center" gap={8}>
          <Title level={2} style={{ margin: 0 }}>
            {characteristic.label}
          </Title>
          <Button
            type="text"
            icon={<PencilSimpleIcon size={20} />}
            aria-label={t("characteristics.renameCharacteristic")}
            data-qa={editDataQa}
            onClick={labelEdit.onOpen}
          />
        </Flex>
      )}

      <Flex gap={12} align="center">
        <HeaderMetaTag>
          <TypeIcon size={16} />
          {characteristic.type === "options"
            ? t("characteristics.typeOptions")
            : t("characteristics.typeText")}
        </HeaderMetaTag>

        <Flex gap={4} align="center">
          <PackageIcon size={16} />
          {t("characteristics.usedInProducts", { count: totalProducts })}
        </Flex>
      </Flex>
    </Flex>
  );
};
