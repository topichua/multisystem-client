import { ChatTextIcon } from "@phosphor-icons/react";
import { Button, Flex, Popconfirm, Typography } from "antd";
import { useTranslation } from "react-i18next";

import * as S from "./settings-templates-layout.styled";

const { Title, Text } = Typography;

type TemplateDetailHeaderProps = {
  name: string;
  saveLoading: boolean;
  deleteLoading: boolean;
  onSave: () => void;
  onDelete: () => void;
};

export const TemplateDetailHeader = ({
  name,
  saveLoading,
  deleteLoading,
  onSave,
  onDelete,
}: TemplateDetailHeaderProps) => {
  const { t } = useTranslation();

  return (
    <Flex justify="space-between" align="flex-start" gap={16} wrap="wrap">
      <Flex align="flex-start" gap={12} style={{ minWidth: 0 }}>
        <S.TemplateHeaderIcon>
          <ChatTextIcon size={20} />
        </S.TemplateHeaderIcon>

        <Flex vertical gap={4} style={{ minWidth: 0 }}>
          <Title level={4} ellipsis style={{ margin: 0 }}>
            {name}
          </Title>
          <Text type="secondary">{t("templates.editHint")}</Text>
        </Flex>
      </Flex>

      <Flex gap={8} align="center" wrap="wrap" style={{ flexShrink: 0 }}>
        <Button type="primary" loading={saveLoading} onClick={onSave}>
          {t("templates.saveChanges")}
        </Button>
        <Popconfirm
          title={t("templates.deleteConfirmTitle")}
          okText={t("templates.delete")}
          okButtonProps={{ danger: true }}
          onConfirm={onDelete}
        >
          <Button danger loading={deleteLoading}>
            {t("templates.delete")}
          </Button>
        </Popconfirm>
      </Flex>
    </Flex>
  );
};
