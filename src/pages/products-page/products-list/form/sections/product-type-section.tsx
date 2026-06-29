import { CubeIcon, SquaresFourIcon } from "@phosphor-icons/react";
import { Card, Flex, Radio, Typography, theme } from "antd";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

const { Title, Text } = Typography;

export type ProductType = "single" | "variants";

export type ProductTypeOption = {
  value: ProductType;
  titleKey: string;
  descriptionKey: string;
  icon: ReactNode;
};

const PRODUCT_TYPE_OPTIONS: ProductTypeOption[] = [
  {
    value: "single",
    titleKey: "products.productType.singleTitle",
    descriptionKey: "products.productType.singleDescription",
    icon: <CubeIcon />,
  },
  {
    value: "variants",
    titleKey: "products.productType.variantsTitle",
    descriptionKey: "products.productType.variantsDescription",
    icon: <SquaresFourIcon />,
  },
];

export type ProductTypeSectionProps = {
  value: ProductType;
  onChange: (nextType: ProductType) => void;
  isMobile?: boolean;
};

export const ProductTypeSection = ({
  value,
  onChange,
  isMobile = false,
}: ProductTypeSectionProps) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();

  return (
    <Card>
      <Flex vertical wrap={true} gap={16}>
        <Flex vertical>
          <Title level={5}>{t("products.productType.title")}</Title>

          <Text type="secondary">{t("products.productType.description")}</Text>
        </Flex>

        <Radio.Group
          value={value}
          onChange={(event) => onChange(event.target.value)}
          style={{ width: "100%" }}
        >
          <Flex gap={isMobile ? 12 : 24} vertical={isMobile}>
            {PRODUCT_TYPE_OPTIONS.map((option) => {
              const isSelected = value === option.value;

              return (
                <Card
                  key={option.value}
                  hoverable
                  onClick={() => onChange(option.value)}
                  {...(isMobile
                    ? {
                        "data-qa": `products-mobile-product-type-${option.value}`,
                      }
                    : {})}
                  style={{
                    width: isMobile ? "100%" : 400,
                    borderColor: isSelected ? token.colorPrimary : undefined,
                    boxShadow: isSelected
                      ? `0 0 0 1px ${token.colorPrimary}`
                      : undefined,
                  }}
                  styles={{
                    body: {
                      padding: "12px 16px 12px 24px",
                    },
                  }}
                >
                  <Flex justify="space-between" align="flex-start" gap={0}>
                    <Flex gap={16}>
                      <Text
                        style={{
                          fontSize: 28,
                          lineHeight: 1,
                          color: isSelected ? token.colorPrimary : undefined,
                        }}
                      >
                        {option.icon}
                      </Text>

                      <Flex vertical flex={1}>
                        <Text strong>{t(option.titleKey)}</Text>
                        <Text type="secondary">{t(option.descriptionKey)}</Text>
                      </Flex>
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
};
