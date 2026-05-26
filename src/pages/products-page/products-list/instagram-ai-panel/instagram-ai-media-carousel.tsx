import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { Button, Flex } from "antd";
import type { EmblaCarouselType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useSyncExternalStore } from "react";

import type { InstagramMediaSlide } from "@/features/products/utils/instagram-media-display";
import { isVideoFileUrl } from "@/features/products/utils/instagram-media-display";

const CAROUSEL_NAV_GAP = 12;
const CAROUSEL_NAV_BUTTON_SIZE = 36;

const EMPTY_SCROLL_SNAPSHOT = "0|0|0";

const toScrollSnapshot = (emblaApi: EmblaCarouselType | undefined): string => {
  if (!emblaApi) {
    return EMPTY_SCROLL_SNAPSHOT;
  }

  return `${emblaApi.selectedScrollSnap()}|${Number(emblaApi.canScrollPrev())}|${Number(emblaApi.canScrollNext())}`;
};

const parseScrollSnapshot = (snapshot: string) => {
  const [index, canPrev, canNext] = snapshot.split("|");
  return {
    selectedIndex: Number(index),
    canScrollPrev: Boolean(Number(canPrev)),
    canScrollNext: Boolean(Number(canNext)),
  };
};

const subscribeToEmblaScroll = (
  emblaApi: EmblaCarouselType | undefined,
  onStoreChange: () => void,
) => {
  if (!emblaApi) {
    return () => {};
  }

  emblaApi.on("select", onStoreChange);
  emblaApi.on("reInit", onStoreChange);

  return () => {
    emblaApi.off("select", onStoreChange);
    emblaApi.off("reInit", onStoreChange);
  };
};

const useEmblaScrollState = (emblaApi: EmblaCarouselType | undefined) => {
  const snapshot = useSyncExternalStore(
    (onStoreChange) => subscribeToEmblaScroll(emblaApi, onStoreChange),
    () => toScrollSnapshot(emblaApi),
    () => EMPTY_SCROLL_SNAPSHOT,
  );

  return parseScrollSnapshot(snapshot);
};

type InstagramAiMediaCarouselProps = {
  slides: InstagramMediaSlide[];
};

export const InstagramAiMediaCarousel = ({
  slides,
}: InstagramAiMediaCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
  });
  const { selectedIndex, canScrollPrev, canScrollNext } =
    useEmblaScrollState(emblaApi);

  const hasMultipleSlides = slides.length > 1;

  useEffect(() => {
    emblaApi?.reInit();
  }, [emblaApi, slides]);

  if (slides.length === 0) {
    return null;
  }

  return (
    <Flex vertical gap={8}>
      <Flex align="center" gap={CAROUSEL_NAV_GAP} style={{ width: "100%" }}>
        {hasMultipleSlides ? (
          <Button
            type="text"
            icon={<CaretLeftIcon size={20} />}
            disabled={!canScrollPrev}
            onClick={() => emblaApi?.scrollPrev()}
            aria-label="Previous slide"
            style={{
              flexShrink: 0,
              width: CAROUSEL_NAV_BUTTON_SIZE,
              height: CAROUSEL_NAV_BUTTON_SIZE,
              padding: 0,
            }}
          />
        ) : null}

        <div
          ref={emblaRef}
          style={{ flex: 1, minWidth: 0, overflow: "hidden", borderRadius: 12 }}
        >
          <div style={{ display: "flex" }}>
            {slides.map((slide) => (
              <div
                key={slide.id}
                style={{
                  flex: "0 0 100%",
                  position: "relative",
                }}
              >
                {isVideoFileUrl(slide.url) ? (
                  <video
                    src={slide.url}
                    controls
                    playsInline
                    style={{
                      width: "100%",
                      height: 300,
                      aspectRatio: "1",
                      objectFit: "cover",
                      display: "block",
                      background: "#000",
                    }}
                  />
                ) : (
                  <img
                    src={slide.url}
                    alt=""
                    style={{
                      width: "100%",
                      height: 300,
                      aspectRatio: "1",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {hasMultipleSlides ? (
          <Button
            type="text"
            icon={<CaretRightIcon size={20} />}
            disabled={!canScrollNext}
            onClick={() => emblaApi?.scrollNext()}
            aria-label="Next slide"
            style={{
              flexShrink: 0,
              width: CAROUSEL_NAV_BUTTON_SIZE,
              height: CAROUSEL_NAV_BUTTON_SIZE,
              padding: 0,
            }}
          />
        ) : null}
      </Flex>

      {hasMultipleSlides ? (
        <Flex justify="center">
          <span
            style={{ fontSize: 13, color: "var(--ant-color-text-secondary)" }}
          >
            {selectedIndex + 1} / {slides.length}
          </span>
        </Flex>
      ) : null}
    </Flex>
  );
};
