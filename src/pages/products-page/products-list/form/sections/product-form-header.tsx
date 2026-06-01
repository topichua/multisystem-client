import { Flex, Typography } from "antd";
import AIAssistanceIcon from "@/components/icons/ai-assistance/AIAssistance.svg?react";
import { AiButton } from "../product-form.styled";

const { Title, Text } = Typography;

export type ProductFormHeaderProps = {
  title: string;
  subtitle: string;
};

export const ProductFormHeader = ({
  title,
  subtitle,
}: ProductFormHeaderProps) => (
  <Flex justify="space-between" align="flex-start" gap={24}>
    <Flex vertical>
      <Title level={3} style={{ margin: 0 }}>
        {title}
      </Title>

      <Text type="secondary">{subtitle}</Text>
    </Flex>

    <AiButton $filled icon={<AIAssistanceIcon />}>
      Add with Instagram using AI
    </AiButton>
  </Flex>
);
