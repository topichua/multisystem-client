import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  CloudArrowUpIcon,
  DotsSixVerticalIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { Button, Flex, Modal, Spin, Tag, Typography, Upload } from "antd";
import type { UploadProps } from "antd";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
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
};

type ProductVariantImagesModalInnerProps = Omit<
  ProductVariantImagesModalProps,
  "variant"
> & {
  variant: ProductVariantUi;
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

  .variant-media-drag {
    position: absolute;
    bottom: 4px;
    left: 4px;
    z-index: 1;
    cursor: grab;
    background: rgba(255, 255, 255, 0.92) !important;
    border-radius: 6px;

    &:active {
      cursor: grabbing;
    }
  }
`;

type SortableVariantMediaCardProps = {
  media: VariantMediaItem;
  index: number;
  onRemove: (media: VariantMediaItem) => void;
};

function SortableVariantMediaCard({
  media,
  index,
  onRemove,
}: SortableVariantMediaCardProps) {
  const { t } = useTranslation();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: media.id });

  return (
    <VariantMediaCard
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.65 : 1,
      }}
    >
      {index === 0 ? (
        <Tag className="variant-media-tag" color="purple">
          {t("products.variant.mainImage")}
        </Tag>
      ) : media.origin === "variant" ? (
        <Tag className="variant-media-tag" color="blue">
          {t("products.variant.variantOnly")}
        </Tag>
      ) : null}

      <Button
        type="text"
        size="small"
        className="variant-media-drag"
        icon={<DotsSixVerticalIcon size={14} />}
        {...attributes}
        {...listeners}
      />

      <img src={media.src} alt="" />

      <Button
        type="text"
        danger
        size="small"
        className="variant-media-delete"
        icon={<TrashIcon size={14} />}
        onClick={() => {
          onRemove(media);
        }}
      />
    </VariantMediaCard>
  );
}

function formatVariantLabel(
  variant: ProductVariantUi,
  fallback: string,
): string {
  const values = variant.customFields
    .map((field) => field.value.trim())
    .filter(Boolean);

  return values.length > 0 ? values.join(" / ") : fallback;
}

export function ProductVariantImagesModal({
  open,
  variant,
  productMedia,
  onClose,
  onApply,
  onUploadVariantImage,
}: ProductVariantImagesModalProps) {
  if (!open || !variant) {
    return null;
  }

  return (
    <ProductVariantImagesModalInner
      key={variant.key}
      open={open}
      variant={variant}
      productMedia={productMedia}
      onClose={onClose}
      onApply={onApply}
      onUploadVariantImage={onUploadVariantImage}
    />
  );
}

function ProductVariantImagesModalInner({
  open,
  variant,
  productMedia,
  onClose,
  onApply,
  onUploadVariantImage,
}: ProductVariantImagesModalInnerProps) {
  const { t } = useTranslation();
  const [draftMedia, setDraftMedia] = useState<VariantMediaItem[]>(() =>
    variant.media.map((item) => ({ ...item })),
  );
  const [uploadingCount, setUploadingCount] = useState(0);
  const [isApplying, setIsApplying] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

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
      const validationError = validateProductImageFile(file, {
        invalidType: t("products.media.invalidType"),
        tooLarge: t("products.media.tooLarge"),
      });

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
    [onUploadVariantImage, t],
  );

  const handleRemoveDraftMedia = useCallback((media: VariantMediaItem) => {
    setDraftMedia((current) => current.filter((item) => item.id !== media.id));
  }, []);

  const handleReorderDraftMedia = useCallback(
    (activeMediaId: number, overMediaId: number) => {
      setDraftMedia((current) => {
        const activeIndex = current.findIndex(
          (media) => media.id === activeMediaId,
        );
        const overIndex = current.findIndex(
          (media) => media.id === overMediaId,
        );

        if (activeIndex < 0 || overIndex < 0 || activeIndex === overIndex) {
          return current;
        }

        const next = [...current];
        const [moved] = next.splice(activeIndex, 1);
        next.splice(overIndex, 0, moved);
        return next;
      });
    },
    [],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) {
        return;
      }

      handleReorderDraftMedia(Number(active.id), Number(over.id));
    },
    [handleReorderDraftMedia],
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

  const handleBeforeUpload = useCallback(
    (file: File) => {
      const validationError = validateProductImageFile(file, {
        invalidType: t("products.media.invalidType"),
        tooLarge: t("products.media.tooLarge"),
      });
      if (validationError) {
        return Upload.LIST_IGNORE;
      }

      return true;
    },
    [t],
  );

  return (
    <Modal
      open={open}
      title={t("products.variant.imagePickerTitle")}
      width={720}
      onCancel={onClose}
      footer={
        <Flex justify="flex-end" gap={8}>
          <Button onClick={onClose}>{t("products.cancelEdit")}</Button>
          <Button
            type="primary"
            loading={isApplying}
            onClick={() => void handleApply()}
          >
            {t("products.media.cropOk")}
          </Button>
        </Flex>
      }
      destroyOnClose
    >
      <Flex vertical gap={24}>
        <Text type="secondary">
          {formatVariantLabel(variant, t("products.variant.fallbackName"))}
        </Text>

        <Flex vertical gap={12}>
          <Title level={5} style={{ margin: 0 }}>
            {t("products.variant.productImages")}
          </Title>

          <Text type="secondary">
            {t("products.variant.selectExistingImages")}
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
            <Text type="secondary">
              {t("products.variant.uploadProductImagesFirst")}
            </Text>
          )}
        </Flex>

        <Flex vertical gap={12}>
          <Title level={5} style={{ margin: 0 }}>
            {t("products.variant.imagePickerTitle")}
          </Title>

          <Text type="secondary">
            {t("products.variant.variantOnlyImagesHint")}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {t("products.variant.reorderImagesHint")}
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
              <p className="ant-upload-text">
                {t("products.variant.uploadVariantOnlyImage")}
              </p>
            </Dragger>
          </Spin>

          {draftMedia.length > 0 ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={draftMedia.map((media) => media.id)}
                strategy={rectSortingStrategy}
              >
                <Flex gap={12} wrap="wrap">
                  {draftMedia.map((media, index) => (
                    <SortableVariantMediaCard
                      key={media.id}
                      media={media}
                      index={index}
                      onRemove={(item) => {
                        handleRemoveDraftMedia(item);
                      }}
                    />
                  ))}
                </Flex>
              </SortableContext>
            </DndContext>
          ) : null}
        </Flex>
      </Flex>
    </Modal>
  );
}
