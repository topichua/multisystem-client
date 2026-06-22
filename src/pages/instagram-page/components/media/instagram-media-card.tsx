import {
  ArrowSquareOutIcon,
  CaretRightIcon,
  CheckIcon,
  HeartIcon,
} from "@phosphor-icons/react";
import type { KeyboardEvent, MouseEvent } from "react";
import { useTranslation } from "react-i18next";

import type { InstagramMediaItem } from "@/features/instagram/model/instagram.types";

import * as S from "../../instagram-page.styled";
import {
  formatCompactNumber,
  formatPostDate,
} from "../../utils/instagram-page-format";
import { InstagramPostMediaPreview } from "./instagram-post-media-preview";

type InstagramMediaCardProps = {
  post: InstagramMediaItem;
  linkedToProduct: boolean;
  productIds: string[];
  onPostClick: (post: InstagramMediaItem) => void;
};

export const InstagramMediaCard = ({
  post,
  linkedToProduct,
  productIds,
  onPostClick,
}: InstagramMediaCardProps) => {
  const { t } = useTranslation();

  const handlePostClick = () => {
    onPostClick(post);
  };

  const handlePostKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handlePostClick();
    }
  };

  const handleSelectClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    handlePostClick();
  };

  return (
    <S.PostCard
      hoverable
      role="button"
      tabIndex={0}
      onClick={handlePostClick}
      onKeyDown={handlePostKeyDown}
    >
      <S.PostMedia>
        {linkedToProduct ? (
          <S.ProductBadge>
            <CheckIcon size={14} />
            {t("instagram.productBadge")}
          </S.ProductBadge>
        ) : null}

        <InstagramPostMediaPreview
          post={post}
          showVideoBadge
          stopCarouselControlPropagation
          videoDisplay="poster"
        />
      </S.PostMedia>

      <S.PostBody>
        <S.PostCaption>
          {post.caption?.trim() || t("instagram.noCaption")}
        </S.PostCaption>

        <S.PostMetaRow>
          <S.PostMetric>
            <HeartIcon size={16} />
            {formatCompactNumber(post.like_count)}
          </S.PostMetric>
          <span>{formatPostDate(post.timestamp)}</span>
          {productIds.length > 0 ? (
            <S.FilterCount $active>{productIds.length}</S.FilterCount>
          ) : null}
          <S.SelectPostButton type="button" onClick={handleSelectClick}>
            {t("instagram.choosePost")}
            <CaretRightIcon size={14} />
          </S.SelectPostButton>
        </S.PostMetaRow>
        <S.PostMetaRow style={{ marginTop: 20 }}>
          {post.permalink ? (
            <S.ExternalPostLink
              target="_blank"
              rel="noopener noreferrer"
              href={post.permalink}
              onClick={(event) => event.stopPropagation()}
            >
              {t("instagram.openOnInstagram")}
              <ArrowSquareOutIcon size={14} />
            </S.ExternalPostLink>
          ) : null}
        </S.PostMetaRow>
      </S.PostBody>
    </S.PostCard>
  );
};
