import { Button, Card, Carousel, Flex, Typography } from "antd";
import type { CarouselRef } from "antd/es/carousel";
import {
  CaretLeftIcon,
  CaretRightIcon,
  ImageIcon,
} from "@phosphor-icons/react";
import type { CSSProperties } from "react";
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import type { InstagramMediaItem } from "@/features/instagram/model/instagram.types";
import { isInstagramVideoMediaType } from "@/features/products/utils/instagram-media-display";

import {
  getPostMediaItems,
  type ProductInstagramPostMedia,
} from "../product-instagram-ai.utils";

const { Text } = Typography;

type ProductInstagramPostMediaPreviewProps = {
  post: InstagramMediaItem;
};

type MediaPreviewProps = {
  media: ProductInstagramPostMedia;
  controls?: boolean;
};

const mediaPreviewStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
};

const MediaPreview = ({ media, controls = false }: MediaPreviewProps) => {
  const isVideo = isInstagramVideoMediaType(media.mediaType);

  return isVideo ? (
    <video
      src={media.url}
      muted
      playsInline
      controls={controls}
      style={mediaPreviewStyle}
    />
  ) : (
    <img src={media.url} alt="" style={mediaPreviewStyle} />
  );
};

export const ProductInstagramPostMediaPreview = ({
  post,
}: ProductInstagramPostMediaPreviewProps) => {
  const { t } = useTranslation();
  const carouselRef = useRef<CarouselRef>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const mediaItems = useMemo(() => getPostMediaItems(post), [post]);

  const selectSlide = (index: number) => {
    setActiveSlide(index);
    carouselRef.current?.goTo(index);
  };

  return (
    <>
      <Flex justify="center">
        <div style={{ width: "100%", maxWidth: 520, position: "relative" }}>
          {mediaItems.length > 0 ? (
            <>
              <Carousel
                ref={carouselRef}
                dots={mediaItems.length > 1}
                afterChange={setActiveSlide}
              >
                {mediaItems.map((media) => (
                  <div key={media.key}>
                    <div
                      style={{
                        aspectRatio: "1 / 1",
                        overflow: "hidden",
                        borderRadius: 16,
                        background: "#f5f5f5",
                      }}
                    >
                      <MediaPreview media={media} controls />
                    </div>
                  </div>
                ))}
              </Carousel>

              {mediaItems.length > 1 && (
                <>
                  <Button
                    shape="circle"
                    icon={<CaretLeftIcon size={18} />}
                    onClick={() =>
                      selectSlide(
                        activeSlide === 0
                          ? mediaItems.length - 1
                          : activeSlide - 1,
                      )
                    }
                    style={{
                      position: "absolute",
                      top: "45%",
                      left: 16,
                      zIndex: 1,
                    }}
                  />
                  <Button
                    shape="circle"
                    icon={<CaretRightIcon size={18} />}
                    onClick={() =>
                      selectSlide(
                        activeSlide === mediaItems.length - 1
                          ? 0
                          : activeSlide + 1,
                      )
                    }
                    style={{
                      position: "absolute",
                      top: "45%",
                      right: 16,
                      zIndex: 1,
                    }}
                  />
                </>
              )}
            </>
          ) : (
            <Card>
              <Flex
                vertical
                align="center"
                justify="center"
                gap={8}
                style={{ aspectRatio: "1 / 1" }}
              >
                <ImageIcon size={42} />
                <Text type="secondary">
                  {t("products.instagram.ai.noMediaPreview")}
                </Text>
              </Flex>
            </Card>
          )}
        </div>
      </Flex>

      {mediaItems.length > 1 && (
        <Flex justify="center" gap={12} wrap="wrap">
          {mediaItems.map((media, index) => (
            <Button
              key={media.key}
              type={activeSlide === index ? "primary" : "default"}
              onClick={() => selectSlide(index)}
              style={{
                width: 58,
                height: 58,
                padding: 0,
                overflow: "hidden",
              }}
            >
              <MediaPreview media={media} />
            </Button>
          ))}
        </Flex>
      )}
    </>
  );
};
