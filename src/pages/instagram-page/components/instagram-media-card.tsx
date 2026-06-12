import {
  ArrowSquareOutIcon,
  CaretRightIcon,
  CheckIcon,
  HeartIcon,
  ImagesIcon,
} from "@phosphor-icons/react";
import type { KeyboardEvent, MouseEvent } from "react";
import { useTranslation } from "react-i18next";

import type { InstagramMediaItem } from "@/features/instagram/model/instagram.types";

import * as S from "../instagram-page.styled";
import {
  formatCompactNumber,
  formatPostDate,
  getPostCoverUrl,
} from "../utils/instagram-page-format";

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
  const coverUrl = getPostCoverUrl(post);
  const carouselCount = post.children?.length ?? 0;

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

        {carouselCount > 1 ? (
          <S.MediaTypeBadge>
            <ImagesIcon size={15} />
            {carouselCount}
          </S.MediaTypeBadge>
        ) : null}

        {coverUrl ? (
          post.media_type === "VIDEO" ? (
            <video src={coverUrl} muted playsInline />
          ) : (
            <img src={coverUrl} alt="" />
          )
        ) : (
          <S.PostMediaPlaceholder>
            <ImagesIcon size={36} />
          </S.PostMediaPlaceholder>
        )}
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
