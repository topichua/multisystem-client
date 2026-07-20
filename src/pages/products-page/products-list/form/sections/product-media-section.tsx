import { Tag } from "@/components/tag/tag";
import { PRODUCT_MEDIA_UPLOAD_FIELD_NAME } from "@/features/products/api/products-api";
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
  ArrowDownIcon,
  ArrowUpIcon,
  CloudArrowUpIcon,
  DotsSixVerticalIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import type { UploadProps } from "antd";
import { Button, Card, Flex, Spin, Typography, Upload } from "antd";
import { UploadedMediaPreview } from "../product-form.styled";
import type { UploadedProductMedia } from "../variants/product-add-variant.types";

const { Title, Text } = Typography;
const { Dragger } = Upload;

type ProductMediaUploadRequestOptions = Parameters<
  NonNullable<UploadProps["customRequest"]>
>[0];

export type ProductMediaSectionProps = {
  uploadedProductMedia: UploadedProductMedia[];
  productMediaUploadingCount: number;
  deletingProductMediaId: number | null;
  onBeforeUpload: (file: File) => boolean | typeof Upload.LIST_IGNORE;
  onUpload: (options: ProductMediaUploadRequestOptions) => void;
  onDelete: (mediaId: number) => void;
  onReorder: (activeMediaId: number, overMediaId: number) => void;
  texts: {
    title: string;
    subtitle: string;
    dragUploadTitle: string;
    mainImageLabel: string;
    deleteTooltip: string;
    uploadHint: string;
    reorderHint: string;
    moveEarlierAria?: string;
    moveLaterAria?: string;
  };
  isMobile?: boolean;
};

type SortableProductMediaPreviewProps = {
  media: UploadedProductMedia;
  isMain: boolean;
  deleting: boolean;
  canMoveEarlier: boolean;
  canMoveLater: boolean;
  onDelete: (mediaId: number) => void;
  onMoveEarlier: () => void;
  onMoveLater: () => void;
  texts: ProductMediaSectionProps["texts"];
  isMobile: boolean;
};

const SortableProductMediaPreview = ({
  media,
  isMain,
  deleting,
  canMoveEarlier,
  canMoveLater,
  onDelete,
  onMoveEarlier,
  onMoveLater,
  texts,
  isMobile,
}: SortableProductMediaPreviewProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: media.id });

  return (
    <UploadedMediaPreview
      ref={setNodeRef}
      $isMain={isMain}
      data-qa={`products-mobile-image-${media.id}`}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.65 : 1,
        width: isMobile ? "100%" : undefined,
        maxWidth: isMobile ? 160 : undefined,
      }}
    >
      {isMain && (
        <Tag className="uploaded-media-main-tag" color="purple">
          {texts.mainImageLabel}
        </Tag>
      )}

      {!isMobile ? (
        <Button
          type="text"
          size="small"
          className="uploaded-media-drag"
          icon={<DotsSixVerticalIcon size={16} />}
          {...attributes}
          {...listeners}
        />
      ) : (
        <Flex className="uploaded-media-move" gap={4}>
          <Button
            type="text"
            size="small"
            icon={<ArrowUpIcon size={16} />}
            aria-label={texts.moveEarlierAria}
            disabled={!canMoveEarlier}
            onClick={onMoveEarlier}
          />
          <Button
            type="text"
            size="small"
            icon={<ArrowDownIcon size={16} />}
            aria-label={texts.moveLaterAria}
            disabled={!canMoveLater}
            onClick={onMoveLater}
          />
        </Flex>
      )}

      <img src={media.src} alt="" />

      <Button
        type="text"
        danger
        size="small"
        className="uploaded-media-delete"
        icon={<TrashIcon size={16} />}
        aria-label={texts.deleteTooltip}
        loading={deleting}
        onClick={() => {
          onDelete(media.id);
        }}
      />
    </UploadedMediaPreview>
  );
};

export const ProductMediaSection = ({
  uploadedProductMedia,
  productMediaUploadingCount,
  deletingProductMediaId,
  onBeforeUpload,
  onUpload,
  onDelete,
  onReorder,
  texts,
  isMobile = false,
}: ProductMediaSectionProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    onReorder(Number(active.id), Number(over.id));
  };

  return (
    <Card data-qa={isMobile ? "products-mobile-images" : undefined}>
      <Flex vertical gap={24}>
        <Flex vertical>
          <Title level={5} style={{ margin: 0 }}>
            {texts.title}
          </Title>

          <Text type="secondary">{texts.subtitle}</Text>
          {!isMobile ? (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {texts.reorderHint}
            </Text>
          ) : (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {texts.reorderHint}
            </Text>
          )}
        </Flex>

        <Flex
          gap={16}
          align="flex-start"
          wrap="wrap"
          vertical={isMobile}
          style={{ width: "100%" }}
        >
          <Spin
            spinning={productMediaUploadingCount > 0}
            style={{ width: isMobile ? "100%" : undefined }}
          >
            <Dragger
              name={PRODUCT_MEDIA_UPLOAD_FIELD_NAME}
              multiple={false}
              accept="image/png,image/jpeg,image/webp"
              showUploadList={false}
              beforeUpload={onBeforeUpload}
              customRequest={onUpload}
              style={{ minHeight: 134, width: isMobile ? "100%" : undefined }}
            >
              <p className="ant-upload-drag-icon">
                <CloudArrowUpIcon size={32} />
              </p>

              <p className="ant-upload-text">{texts.dragUploadTitle}</p>

              <p className="ant-upload-hint">{texts.uploadHint}</p>
            </Dragger>
          </Spin>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={uploadedProductMedia.map((media) => media.id)}
              strategy={rectSortingStrategy}
            >
              <Flex
                gap={16}
                align="flex-start"
                wrap="wrap"
                style={{ width: isMobile ? "100%" : undefined }}
              >
                {uploadedProductMedia.map((media, index) => (
                  <SortableProductMediaPreview
                    key={media.id}
                    media={media}
                    isMain={index === 0}
                    deleting={deletingProductMediaId === media.id}
                    canMoveEarlier={index > 0}
                    canMoveLater={index < uploadedProductMedia.length - 1}
                    onDelete={onDelete}
                    onMoveEarlier={() => {
                      const previous = uploadedProductMedia[index - 1];
                      if (previous) {
                        onReorder(media.id, previous.id);
                      }
                    }}
                    onMoveLater={() => {
                      const next = uploadedProductMedia[index + 1];
                      if (next) {
                        onReorder(media.id, next.id);
                      }
                    }}
                    texts={texts}
                    isMobile={isMobile}
                  />
                ))}
              </Flex>
            </SortableContext>
          </DndContext>
        </Flex>
      </Flex>
    </Card>
  );
};
