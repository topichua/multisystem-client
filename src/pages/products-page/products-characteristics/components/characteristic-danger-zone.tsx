import { TrashIcon } from "@phosphor-icons/react";
import { Button, Popconfirm } from "antd";
import { useTranslation } from "react-i18next";

type CharacteristicDangerZoneProps = {
  deleteLoading: boolean;
  onDelete: () => Promise<void>;
  deleteDataQa?: string;
  mobileLayout?: boolean;
};

export const CharacteristicDangerZone = ({
  deleteLoading,
  onDelete,
  deleteDataQa,
  mobileLayout = false,
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
        type={mobileLayout ? "default" : "text"}
        block={mobileLayout}
        icon={<TrashIcon size={18} />}
        loading={deleteLoading}
        data-qa={deleteDataQa}
        aria-label={t("characteristics.mobile.deleteCharacteristicAria")}
        style={
          mobileLayout
            ? undefined
            : { alignSelf: "flex-start", paddingInline: 0 }
        }
      >
        {t("characteristics.deleteCharacteristic")}
      </Button>
    </Popconfirm>
  );
};
