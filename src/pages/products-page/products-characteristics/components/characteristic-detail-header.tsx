import { PackageIcon, PencilSimpleIcon } from "@phosphor-icons/react";
import { Button, Flex, Input, Typography } from "antd";
import { useTranslation } from "react-i18next";

import { CharacteristicTypeTag } from "@/features/characteristics/components/characteristic-type-tag";
import type { CharacteristicBase } from "@/features/characteristics/model/characteristic.types";

import { CHARACTERISTIC_NAME_MAX_LENGTH } from "../products-characteristics.constants";

const { Title } = Typography;

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

  return (
    <Flex vertical gap={12}>
      {labelEdit.isEditing ? (
        <Flex align="center" gap={8} wrap={false} style={{ width: "100%" }}>
          <Input
            autoFocus
            value={labelEdit.value}
            maxLength={CHARACTERISTIC_NAME_MAX_LENGTH}
            onChange={(event) => labelEdit.onChange(event.target.value)}
            onPressEnter={() => void labelEdit.onSave()}
            style={{ flex: 1, minWidth: 0 }}
          />
          <Button onClick={labelEdit.onCancel} style={{ flexShrink: 0 }}>
            {t("characteristics.cancel")}
          </Button>
          <Button
            type="primary"
            loading={saveLoading}
            onClick={() => void labelEdit.onSave()}
            style={{ flexShrink: 0 }}
          >
            {t("characteristics.saveChanges")}
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
        <CharacteristicTypeTag type={characteristic.type} />

        <Flex gap={4} align="center">
          <PackageIcon size={16} />
          {t("characteristics.usedInProducts", { count: totalProducts })}
        </Flex>
      </Flex>
    </Flex>
  );
};
