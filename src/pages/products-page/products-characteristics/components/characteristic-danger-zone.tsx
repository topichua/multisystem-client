import {
  ArchiveIcon,
  ArrowClockwiseIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { Button, Flex, Popconfirm } from "antd";
import { useTranslation } from "react-i18next";

type CharacteristicDangerZoneProps = {
  isArchived: boolean;
  archiveLoading: boolean;
  deleteLoading: boolean;
  onArchive: () => void;
  onUnarchive: () => Promise<void>;
  onDelete: () => Promise<void>;
  archiveDataQa?: string;
  deleteDataQa?: string;
  mobileLayout?: boolean;
};

export const CharacteristicDangerZone = ({
  isArchived,
  archiveLoading,
  deleteLoading,
  onArchive,
  onUnarchive,
  onDelete,
  archiveDataQa,
  deleteDataQa,
  mobileLayout = false,
}: CharacteristicDangerZoneProps) => {
  const { t } = useTranslation();

  const buttonType = mobileLayout ? "default" : "text";
  const buttonStyle = mobileLayout
    ? undefined
    : { alignSelf: "flex-start" as const, paddingInline: 0 };

  return (
    <Flex
      gap={mobileLayout ? 8 : 16}
      align="center"
      justify="space-between"
      wrap="wrap"
      vertical={mobileLayout}
    >
      <Button
        type={buttonType}
        block={mobileLayout}
        icon={
          isArchived ? (
            <ArrowClockwiseIcon size={18} />
          ) : (
            <ArchiveIcon size={18} />
          )
        }
        loading={archiveLoading}
        data-qa={archiveDataQa}
        aria-label={
          isArchived
            ? t("characteristics.mobile.unarchiveCharacteristicAria")
            : t("characteristics.mobile.archiveCharacteristicAria")
        }
        style={buttonStyle}
        onClick={() => {
          if (isArchived) {
            void onUnarchive();
            return;
          }

          onArchive();
        }}
      >
        {isArchived
          ? t("characteristics.unarchiveCharacteristic")
          : t("characteristics.archiveCharacteristic")}
      </Button>

      <Popconfirm
        title={t("characteristics.deleteConfirm")}
        description={t("characteristics.deleteWarning")}
        okText={t("characteristics.delete")}
        okButtonProps={{ danger: true }}
        onConfirm={() => void onDelete()}
      >
        <Button
          danger
          type={buttonType}
          block={mobileLayout}
          icon={<TrashIcon size={18} />}
          loading={deleteLoading}
          data-qa={deleteDataQa}
          aria-label={t("characteristics.mobile.deleteCharacteristicAria")}
          style={buttonStyle}
        >
          {t("characteristics.deleteCharacteristic")}
        </Button>
      </Popconfirm>
    </Flex>
  );
};
