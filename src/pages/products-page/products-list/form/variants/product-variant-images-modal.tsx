import { CloudArrowUpIcon, TrashIcon } from "@phosphor-icons/react";
import { Button, Flex, Modal, Spin, Tag, Typography, Upload } from "antd";
import type { UploadProps } from "antd";
import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";

import { PRODUCT_MEDIA_UPLOAD_FIELD_NAME } from "@/features/products/api/products-api";

import type {
  ProductVariantUi,
  UploadedProductMedia,
  VariantMediaItem,
} from "./product-add-variant.types";
import { validateProductImageFile } from "../media/product-image-upload";

const { Text, Title } = Typography;
const { Dragger } = Upload;

type VariantMediaUploadRequestOptions = Parameters<
  NonNullable<UploadProps["customRequest"]>
>[0];

type ProductVariantImagesModalProps = {
  open: boolean;
  variant: ProductVariantUi | null;
  productMedia: UploadedProductMedia[];
  onClose: () => void;
  onApply: (variantKey: string, media: VariantMediaItem[]) => void;
  onUploadVariantImage: (file: File) => Promise<VariantMediaItem>;
  onRemoveVariantImage: (media: VariantMediaItem) => Promise<void>;
};

const MediaThumb = styled.button<{ $selected?: boolean }>`
  position: relative;
  width: 88px;
  height: 88px;
  padding: 0;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid
    ${(props) =>
      props.$selected
        ? props.theme.colors.base.blue[5]
        : props.theme.colors.functional.border.split};
  background: transparent;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const VariantMediaCard = styled.div`
  position: relative;
  width: 88px;
  height: 88px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid ${(props) => props.theme.colors.functional.border.split};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .variant-media-tag {
    position: absolute;
    top: 4px;
    left: 4px;
    z-index: 1;
    margin: 0;
  }

  .variant-media-delete {
    position: absolute;
    top: 4px;
    right: 4px;
    z-index: 1;
    background: rgba(255, 255, 255, 0.92) !important;
    border-radius: 6px;
  }
`;

function formatVariantLabel(variant: ProductVariantUi): string {
  const values = variant.customFields
    .map((field) => field.value.trim())
    .filter(Boolean);

  return values.length > 0 ? values.join(" / ") : "Variant";
}

export function ProductVariantImagesModal({
  open,
  variant,
  productMedia,
  onClose,
  onApply,
  onUploadVariantImage,
  onRemoveVariantImage,
}: ProductVariantImagesModalProps) {
  const [draftMedia, setDraftMedia] = useState<VariantMediaItem[]>([]);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [removingMediaId, setRemovingMediaId] = useState<number | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    if (!open || !variant) {
      return;
    }

    setDraftMedia(variant.media.map((item) => ({ ...item })));
  }, [open, variant]);

  const isProductImageSelected = useCallback(
    (mediaId: number) => draftMedia.some((item) => item.id === mediaId),
    [draftMedia],
  );

  const handleToggleProductImage = useCallback(
    (image: UploadedProductMedia) => {
      setDraftMedia((current) => {
        if (current.some((item) => item.id === image.id)) {
          return current;
        }

        return [
          ...current,
          { id: image.id, src: image.src, origin: "product" },
        ];
      });
    },
    [],
  );

  const handleVariantMediaUpload = useCallback(
    async (options: VariantMediaUploadRequestOptions) => {
      const file = options.file as File;
      const validationError = validateProductImageFile(file);

      if (validationError) {
        options.onError?.(new Error(validationError));
        return;
      }

      setUploadingCount((count) => count + 1);

      try {
        const uploaded = await onUploadVariantImage(file);

        setDraftMedia((current) => {
          if (current.some((item) => item.id === uploaded.id)) {
            return current;
          }

          return [...current, uploaded];
        });
        options.onSuccess?.(uploaded);
      } catch (error) {
        options.onError?.(error as Error);
      } finally {
        setUploadingCount((count) => Math.max(0, count - 1));
      }
    },
    [onUploadVariantImage],
  );

  const handleRemoveDraftMedia = useCallback(
    async (media: VariantMediaItem) => {
      setRemovingMediaId(media.id);

      try {
        if (media.origin === "variant") {
          await onRemoveVariantImage(media);
        }

        setDraftMedia((current) =>
          current.filter((item) => item.id !== media.id),
        );
      } finally {
        setRemovingMediaId((current) =>
          current === media.id ? null : current,
        );
      }
    },
    [onRemoveVariantImage],
  );

  const handleApply = useCallback(async () => {
    if (!variant) {
      return;
    }

    setIsApplying(true);

    try {
      onApply(variant.key, draftMedia);
      onClose();
    } finally {
      setIsApplying(false);
    }
  }, [draftMedia, onApply, onClose, variant]);

  const handleBeforeUpload = useCallback((file: File) => {
    const validationError = validateProductImageFile(file);
    if (validationError) {
      return Upload.LIST_IGNORE;
    }

    return true;
  }, []);

  if (!variant) {
    return null;
  }

  return (
    <Modal
      open={open}
      title="Variant images"
      width={720}
      onCancel={onClose}
      footer={
        <Flex justify="flex-end" gap={8}>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="primary"
            loading={isApplying}
            onClick={() => void handleApply()}
          >
            Apply
          </Button>
        </Flex>
      }
      destroyOnClose
    >
      <Flex vertical gap={24}>
        <Text type="secondary">{formatVariantLabel(variant)}</Text>

        <Flex vertical gap={12}>
          <Title level={5} style={{ margin: 0 }}>
            Product images
          </Title>

          <Text type="secondary">
            Select existing product images for this variant.
          </Text>

          {productMedia.length > 0 ? (
            <Flex gap={12} wrap="wrap">
              {productMedia.map((image) => {
                const selected = isProductImageSelected(image.id);

                return (
                  <MediaThumb
                    key={image.id}
                    type="button"
                    $selected={selected}
                    onClick={() => handleToggleProductImage(image)}
                    aria-pressed={selected}
                  >
                    <img src={image.src} alt="" />
                  </MediaThumb>
                );
              })}
            </Flex>
          ) : (
            <Text type="secondary">Upload product images first.</Text>
          )}
        </Flex>

        <Flex vertical gap={12}>
          <Title level={5} style={{ margin: 0 }}>
            Variant images
          </Title>

          <Text type="secondary">
            Images uploaded here belong only to this variant.
          </Text>

          <Spin spinning={uploadingCount > 0}>
            <Dragger
              name={PRODUCT_MEDIA_UPLOAD_FIELD_NAME}
              multiple={false}
              accept="image/png,image/jpeg,image/webp"
              showUploadList={false}
              beforeUpload={handleBeforeUpload}
              customRequest={handleVariantMediaUpload}
              style={{ padding: 16 }}
            >
              <p className="ant-upload-drag-icon">
                <CloudArrowUpIcon size={28} />
              </p>
              <p className="ant-upload-text">Upload variant-only image</p>
            </Dragger>
          </Spin>

          {draftMedia.length > 0 ? (
            <Flex gap={12} wrap="wrap">
              {draftMedia.map((media, index) => (
                <VariantMediaCard key={media.id}>
                  {index === 0 ? (
                    <Tag className="variant-media-tag" color="purple">
                      Main
                    </Tag>
                  ) : media.origin === "variant" ? (
                    <Tag className="variant-media-tag" color="blue">
                      Variant only
                    </Tag>
                  ) : null}

                  <img src={media.src} alt="" />

                  <Button
                    type="text"
                    danger
                    size="small"
                    className="variant-media-delete"
                    icon={<TrashIcon size={14} />}
                    loading={removingMediaId === media.id}
                    onClick={() => {
                      void handleRemoveDraftMedia(media);
                    }}
                  />
                </VariantMediaCard>
              ))}
            </Flex>
          ) : null}
        </Flex>
      </Flex>
    </Modal>
  );
}
