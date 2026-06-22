import { Flex, Typography } from "antd";
import { useTranslation } from "react-i18next";

import type { InstagramMediaItem } from "@/features/instagram/model/instagram.types";

import * as S from "./instagram-post-detail-content.styled";

const { Paragraph } = Typography;

type InstagramPostDescriptionSectionProps = {
  post: InstagramMediaItem;
};

export const InstagramPostDescriptionSection = ({
  post,
}: InstagramPostDescriptionSectionProps) => {
  const { t } = useTranslation();

  return (
    <Flex justify="stretch" vertical gap={10}>
      <Flex align="center" justify="space-between" gap={16}>
        <S.SectionTitle>{t("instagram.postDescription")}</S.SectionTitle>
        {/* <Button icon={<MagicWandIcon size={16} />}>
          {t('instagram.composeWithAi')}
        </Button> */}
      </Flex>

      <S.DescriptionBox>
        <Paragraph>
          {post.caption?.trim() || t("instagram.noCaption")}
        </Paragraph>
      </S.DescriptionBox>

      {/* <Text type="secondary">{t('instagram.aiDescriptionHint')}</Text> */}
    </Flex>
  );
};
