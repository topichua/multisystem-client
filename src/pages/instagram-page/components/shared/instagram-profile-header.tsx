import { useTranslation } from "react-i18next";

import type {
  InstagramIntegration,
  InstagramMediaPaging,
} from "@/features/instagram/model/instagram.types";

import {
  formatCompactNumber,
  formatHandle,
} from "../../utils/instagram-page-format";
import { Avatar, Typography } from "antd";
import * as S from "../../instagram-page.styled";

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
    <S.ProfileHeader>
      <Avatar size={50} src={integration.avatar} alt={integration.name}>
        {integration.name.charAt(0).toUpperCase()}
      </Avatar>

      <S.ProfileCopy>
        <S.ProfileTitleRow>
          <Title level={5}>{integration.name}</Title>
          <Text type="secondary">
            ({formatHandle(integration.username ?? integration.name)})
          </Text>
        </S.ProfileTitleRow>
        <S.ProfileStats>
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
        </S.ProfileStats>
      </S.ProfileCopy>
    </S.ProfileHeader>
  );
};
