import {
  ArrowSquareOutIcon,
  ChatCircleIcon,
  HeartIcon,
} from "@phosphor-icons/react";
import { Button, Flex, Typography } from "antd";
import { useTranslation } from "react-i18next";

import { InstagramLogoIcon } from "@/components/icons/instagram/instagram-logo-icon";
import type {
  InstagramIntegration,
  InstagramMediaItem,
} from "@/features/instagram/model/instagram.types";

import {
  formatCompactNumber,
  formatHandle,
  formatPostDate,
} from "../../utils/instagram-page-format";
import { InstagramPostMediaPreview } from "../media/instagram-post-media-preview";
import * as S from "./instagram-post-detail-content.styled";
import { InstagramPostDescriptionSection } from "./instagram-post-description-section";

const { Text, Title } = Typography;

type InstagramPostSummaryProps = {
  commentsOpen: boolean;
  post: InstagramMediaItem;
  selectedIntegration: InstagramIntegration;
  onToggleComments: () => void;
};

export const InstagramPostSummary = ({
  commentsOpen,
  post,
  selectedIntegration,
  onToggleComments,
}: InstagramPostSummaryProps) => {
  const { t } = useTranslation();

  return (
    <>
      <Flex align="center" justify="space-between" gap={16}>
        <Flex align="center" gap={12}>
          <InstagramLogoIcon size={40} />

          <Flex vertical gap={0}>
            <S.AccountTitle>
              <Title level={4}>{formatHandle(selectedIntegration.name)}</Title>
            </S.AccountTitle>
            <Text type="secondary">{formatPostDate(post.timestamp)}</Text>
          </Flex>
        </Flex>

        {post.permalink ? (
          <Button
            type="text"
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("instagram.openOnInstagram")}
            <ArrowSquareOutIcon size={18} />
          </Button>
        ) : null}
      </Flex>

      <Flex gap={24} justify="flex-start">
        <Flex vertical gap={12}>
          <S.MediaPreview>
            <InstagramPostMediaPreview post={post} />
          </S.MediaPreview>
          <Flex align="center" justify="space-between" gap={24} wrap="wrap">
            <Flex align="center" gap={8}>
              <S.Metric>
                <HeartIcon size={18} />
                <Text strong>{formatCompactNumber(post.like_count)}</Text>
              </S.Metric>
              <S.MetricButton
                aria-pressed={commentsOpen}
                onClick={onToggleComments}
                type="button"
              >
                <ChatCircleIcon size={18} />
                <Text strong>{formatCompactNumber(post.comments_count)}</Text>
              </S.MetricButton>
            </Flex>
            <Text type="secondary">{formatPostDate(post.timestamp)}</Text>
          </Flex>
        </Flex>
        <InstagramPostDescriptionSection post={post} />
      </Flex>
    </>
  );
};
