import {
  CaretLeftIcon,
  CaretRightIcon,
  ImagesIcon,
  VideoIcon,
} from "@phosphor-icons/react";
import { Carousel } from "antd";
import type { MouseEvent } from "react";
import { useRef } from "react";
import type { CarouselRef } from "antd/es/carousel";

import type { InstagramMediaItem } from "@/features/instagram/model/instagram.types";
import {
  getPostMediaSlides,
  type InstagramMediaSlide,
} from "@/features/products/utils/instagram-media-display";

import * as S from "../../instagram-page.styled";

type InstagramPostMediaPreviewProps = {
  post: InstagramMediaItem;
  showVideoBadge?: boolean;
  stopCarouselControlPropagation?: boolean;
  videoDisplay?: "poster" | "video";
};

const renderSlide = (
  slide: InstagramMediaSlide,
  videoDisplay: InstagramPostMediaPreviewProps["videoDisplay"],
) => {
  if (
    slide.type === "video" &&
    (videoDisplay === "video" || !slide.posterUrl)
  ) {
    return <video src={slide.url} poster={slide.posterUrl} muted playsInline />;
  }

  return <img src={slide.posterUrl ?? slide.url} alt="" />;
};

export const InstagramPostMediaPreview = ({
  post,
  showVideoBadge = false,
  stopCarouselControlPropagation = false,
  videoDisplay = "video",
}: InstagramPostMediaPreviewProps) => {
  const carouselRef = useRef<CarouselRef>(null);
  const slides = getPostMediaSlides(post);
  const showCarousel = slides.length > 1;
  const showSingleVideoBadge =
    showVideoBadge && slides.length === 1 && slides[0]?.type === "video";
  const handleCarouselControlClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (!stopCarouselControlPropagation) {
      return;
    }

    event.stopPropagation();
  };

  return (
    <>
      {showCarousel && (
        <S.MediaTypeBadge>
          <ImagesIcon size={15} />
          {slides.length}
        </S.MediaTypeBadge>
      )}

      {showSingleVideoBadge && (
        <S.MediaTypeBadge>
          <VideoIcon size={15} />
        </S.MediaTypeBadge>
      )}

      {slides.length > 0 ? (
        showCarousel ? (
          <div style={{ height: "100%" }}>
            <Carousel ref={carouselRef} dots={false}>
              {slides.map((slide) => (
                <div key={slide.id}>{renderSlide(slide, videoDisplay)}</div>
              ))}
            </Carousel>
            <S.MediaCarouselButton
              type="button"
              $side="left"
              aria-label="Previous media"
              onClick={(event) => {
                handleCarouselControlClick(event);
                carouselRef.current?.prev();
              }}
            >
              <CaretLeftIcon size={18} />
            </S.MediaCarouselButton>
            <S.MediaCarouselButton
              type="button"
              $side="right"
              aria-label="Next media"
              onClick={(event) => {
                handleCarouselControlClick(event);
                carouselRef.current?.next();
              }}
            >
              <CaretRightIcon size={18} />
            </S.MediaCarouselButton>
          </div>
        ) : (
          renderSlide(slides[0], videoDisplay)
        )
      ) : (
        <S.PostMediaPlaceholder>
          <ImagesIcon size={36} />
        </S.PostMediaPlaceholder>
      )}
    </>
  );
};
