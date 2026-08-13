import { ArchiveIcon } from "@phosphor-icons/react";
import { Button, Flex, Modal, Typography } from "antd";
import { useTranslation } from "react-i18next";

const { Text } = Typography;

export type CharacteristicArchiveTarget =
  { type: "characteristic"; label: string } | { type: "option"; label: string };

type CharacteristicArchiveModalProps = {
  target: CharacteristicArchiveTarget | null;
  loading: boolean;
  open: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
};

export function CharacteristicArchiveModal({
  target,
  loading,
  open,
  onCancel,
  onConfirm,
}: CharacteristicArchiveModalProps) {
  const { t } = useTranslation();
  const isOption = target?.type === "option";

  const title =
    target == null
      ? null
      : isOption
        ? t("characteristics.optionArchiveModal.title", {
            name: target.label,
          })
        : t("characteristics.archiveModal.title", {
            name: target.label,
          });

  return (
    <Modal
      destroyOnHidden
      centered
      open={open}
      title={title}
      closable={!loading}
      keyboard={!loading}
      mask={{ closable: !loading }}
      onCancel={onCancel}
      width={400}
      footer={
        <Flex gap={8} justify="flex-end">
          <Button disabled={loading} onClick={onCancel}>
            {t("characteristics.archiveModal.cancel")}
          </Button>
          <Button
            type="primary"
            loading={loading}
            icon={<ArchiveIcon size={16} />}
            onClick={() => void onConfirm()}
          >
            {isOption
              ? t("characteristics.optionArchiveModal.confirm")
              : t("characteristics.archiveModal.confirm")}
          </Button>
        </Flex>
      }
    >
      <Text>
        {isOption
          ? t("characteristics.optionArchiveModal.description")
          : t("characteristics.archiveModal.description")}
      </Text>
    </Modal>
  );
}
