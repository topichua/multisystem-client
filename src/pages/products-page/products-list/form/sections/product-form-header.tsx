import { Flex, Typography } from "antd";
import { useTranslation } from "react-i18next";

import AIAssistanceIcon from "@/components/icons/ai-assistance/AIAssistance.svg?react";

import { AiButton } from "../product-form.styled";

const { Title, Text } = Typography;

export type ProductFormHeaderProps = {
  title: string;
  subtitle: string;
  onInstagramAiClick: () => void;
};

export const ProductFormHeader = ({
  title,
  subtitle,
  onInstagramAiClick,
}: ProductFormHeaderProps) => {
  const { t } = useTranslation();

  return (
    <Flex justify="space-between" align="flex-start" gap={24}>
      <Flex vertical>
        <Title level={2} style={{ margin: 0 }}>
          {title}
        </Title>

        <Text type="secondary">{subtitle}</Text>
      </Flex>

      <AiButton
        $filled
        htmlType="button"
        icon={<AIAssistanceIcon />}
        onClick={onInstagramAiClick}
      >
        {t("products.instagram.ai.addWithInstagramButton")}
      </AiButton>
    </Flex>
  );
};
