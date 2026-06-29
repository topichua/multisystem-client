import {
  ArrowSquareOutIcon,
  ChatCircleIcon,
  HeartIcon,
} from "@phosphor-icons/react";
import { Typography } from "antd";
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
      <S.SummaryHeader>
        <S.SummaryAccount>
          <InstagramLogoIcon size={40} />

          <S.SummaryAccountCopy>
            <S.AccountTitle>
              <Title level={4}>{formatHandle(selectedIntegration.name)}</Title>
            </S.AccountTitle>
            <Text type="secondary">{formatPostDate(post.timestamp)}</Text>
          </S.SummaryAccountCopy>
        </S.SummaryAccount>

        {post.permalink ? (
          <S.ExternalButton
            type="text"
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("instagram.openOnInstagram")}
            <ArrowSquareOutIcon size={18} />
          </S.ExternalButton>
        ) : null}
      </S.SummaryHeader>

      <S.SummaryBody>
        <S.SummaryMediaColumn>
          <S.MediaPreview>
            <InstagramPostMediaPreview post={post} />
          </S.MediaPreview>
          <S.SummaryMetaRow>
            <S.MetricsGroup>
              <S.Metric>
                <HeartIcon size={18} />
                <Text strong>{formatCompactNumber(post.like_count)}</Text>
              </S.Metric>
              <S.MetricButton
                aria-label={t("instagram.mobile.openCommentsAria")}
                aria-pressed={commentsOpen}
                onClick={onToggleComments}
                type="button"
              >
                <ChatCircleIcon size={18} />
                <Text strong>{formatCompactNumber(post.comments_count)}</Text>
              </S.MetricButton>
            </S.MetricsGroup>
            <Text type="secondary">{formatPostDate(post.timestamp)}</Text>
          </S.SummaryMetaRow>
        </S.SummaryMediaColumn>
        <InstagramPostDescriptionSection post={post} />
      </S.SummaryBody>
    </>
  );
};
