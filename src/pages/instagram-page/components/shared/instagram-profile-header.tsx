import { useTranslation } from "react-i18next";

import type {
  InstagramIntegration,
  InstagramMediaPaging,
} from "@/features/instagram/model/instagram.types";

import {
  formatCompactNumber,
  formatHandle,
} from "../../utils/instagram-page-format";
import { Avatar, Flex, Typography } from "antd";

const { Text, Title } = Typography;

type InstagramProfileHeaderProps = {
  integration: InstagramIntegration;
  mediaPaging: InstagramMediaPaging | null;
};

export const InstagramProfileHeader = ({
  integration,
  mediaPaging,
}: InstagramProfileHeaderProps) => {
  const { t } = useTranslation();
  const postsCount = integration.posts_count ?? integration.media_count;

  return (
    <Flex gap={16} align="center">
      <Avatar size={50} src={integration.avatar} alt={integration.name}>
        {integration.name.charAt(0).toUpperCase()}
      </Avatar>

      <Flex vertical gap={4}>
        <Title level={5} style={{ margin: 0 }}>
          {integration.name}
          <Text type="secondary">
            &nbsp;&nbsp;(
            {formatHandle(integration.username ?? integration.name)})
          </Text>
        </Title>
        <Flex gap={16} align="center">
          <Text>
            <Text strong>
              {formatCompactNumber(postsCount ?? mediaPaging?.total)}{" "}
            </Text>
            {t("instagram.postsLabel")}
          </Text>
          <Text>
            <Text strong>
              {formatCompactNumber(integration.followers_count)}{" "}
            </Text>
            {t("instagram.followersLabel")}
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
};
