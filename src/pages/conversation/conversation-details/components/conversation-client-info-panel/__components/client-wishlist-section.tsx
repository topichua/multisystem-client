import { HeartIcon } from "@phosphor-icons/react";
import { Button, Collapse, Empty, Flex, Space, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components";

const { Text } = Typography;

const sectionLabelStyle = {
  // fontSize: 12,
  fontWeight: 600,
  letterSpacing: "0.06em",
  textTransform: "uppercase" as const,
};

export function ClientWishlistSection() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const heartColor = colors.base.red[5];

  return (
    <Collapse
      ghost
      defaultActiveKey={["wishlist"]}
      expandIconPlacement="start"
      items={[
        {
          key: "wishlist",
          label: (
            <Flex
              align="center"
              justify="space-between"
              style={{ width: "100%", paddingRight: 8 }}
            >
              <Flex align="center" gap={8}>
                <HeartIcon size={16} color={heartColor} />
                <Text type="secondary" style={sectionLabelStyle}>
                  {t("conversation.clientProfile.wishlist.title")}
                </Text>
              </Flex>
              <Button
                type="link"
                size="small"
                style={{ padding: 0, height: "auto" }}
                onClick={(event) => event.stopPropagation()}
              >
                {t("conversation.clientProfile.wishlist.add")}
              </Button>
            </Flex>
          ),
          children: (
            <Empty
              image={<HeartIcon size={40} color={heartColor} />}
              description={
                <Space orientation="vertical" size={4}>
                  <Text type="secondary">
                    {t("conversation.clientProfile.wishlist.emptyTitle")}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    {t("conversation.clientProfile.wishlist.emptyDescription")}
                  </Text>
                </Space>
              }
            />
          ),
        },
      ]}
      styles={{
        header: {
          padding: 0,
        },
      }}
    />
  );
}
