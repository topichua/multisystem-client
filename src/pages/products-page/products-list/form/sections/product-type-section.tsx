import { CubeIcon, SquaresFourIcon } from "@phosphor-icons/react";
import { Card, Flex, Radio, Typography } from "antd";
import type { ReactNode } from "react";

const { Title, Text } = Typography;

export type ProductType = "single" | "variants";

export type ProductTypeOption = {
  value: ProductType;
  title: string;
  description: string;
  icon: ReactNode;
};

const PRODUCT_TYPE_OPTIONS: ProductTypeOption[] = [
  {
    value: "single",
    title: "Single product",
    description: "Product without variants",
    icon: <CubeIcon />,
  },
  {
    value: "variants",
    title: "Product with variants",
    description: "Product with variants (size, color, etc.)",
    icon: <SquaresFourIcon />,
  },
];

export type ProductTypeSectionProps = {
  value: ProductType;
  onChange: (nextType: ProductType) => void;
};

export const ProductTypeSection = ({
  value,
  onChange,
}: ProductTypeSectionProps) => (
  <Card>
    <Flex gap={32} align="center">
      <Flex vertical flex="0 0 320px">
        <Title level={5}>Product type</Title>

        <Text type="secondary">
          Select the product type. This determines the set of fields in the
          form.
        </Text>
      </Flex>

      <Radio.Group
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{ flex: 1 }}
      >
        <Flex gap={24}>
          {PRODUCT_TYPE_OPTIONS.map((option) => {
            const isSelected = value === option.value;

            return (
              <Card
                key={option.value}
                hoverable
                onClick={() => onChange(option.value)}
                style={{
                  flex: 1,
                  borderColor: isSelected ? "#9254de" : undefined,
                  boxShadow: isSelected ? "0 0 0 1px #9254de" : undefined,
                }}
                styles={{
                  body: {
                    padding: 24,
                  },
                }}
              >
                <Flex align="flex-start" gap={20}>
                  <Text
                    style={{
                      fontSize: 28,
                      lineHeight: 1,
                      color: isSelected ? "#9254de" : undefined,
                    }}
                  >
                    {option.icon}
                  </Text>

                  <Flex vertical flex={1}>
                    <Text strong>{option.title}</Text>
                    <Text type="secondary">{option.description}</Text>
                  </Flex>

                  <Radio value={option.value} />
                </Flex>
              </Card>
            );
          })}
        </Flex>
      </Radio.Group>
    </Flex>
  </Card>
);
