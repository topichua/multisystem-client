import { TrashIcon } from "@phosphor-icons/react";
import { Button, Popconfirm } from "antd";
import { useTranslation } from "react-i18next";

type CharacteristicDangerZoneProps = {
  deleteLoading: boolean;
  onDelete: () => Promise<void>;
};

export const CharacteristicDangerZone = ({
  deleteLoading,
  onDelete,
}: CharacteristicDangerZoneProps) => {
  const { t } = useTranslation();

  return (
    <Popconfirm
      title={t("characteristics.deleteConfirm")}
      description={t("characteristics.deleteWarning")}
      okText={t("characteristics.delete")}
      okButtonProps={{ danger: true }}
      onConfirm={() => void onDelete()}
    >
      <Button
        danger
        type="text"
        icon={<TrashIcon size={18} />}
        loading={deleteLoading}
        style={{ alignSelf: "flex-start", paddingInline: 0 }}
      >
        {t("characteristics.deleteCharacteristic")}
      </Button>
    </Popconfirm>
  );
};
