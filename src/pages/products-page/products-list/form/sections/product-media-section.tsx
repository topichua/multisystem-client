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
import { Button, Card, Flex, Spin, Tag, Typography, Upload } from "antd";
import type { UploadProps } from "antd";
import { PRODUCT_MEDIA_UPLOAD_FIELD_NAME } from "@/features/products/api/products-api";
import type { UploadedProductMedia } from "../variants/product-add-variant.types";
import { UploadedMediaPreview } from "../product-form.styled";

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
  };
};

type SortableProductMediaPreviewProps = {
  media: UploadedProductMedia;
  isMain: boolean;
  deleting: boolean;
  onDelete: (mediaId: number) => void;
  texts: ProductMediaSectionProps["texts"];
};

const SortableProductMediaPreview = ({
  media,
  isMain,
  deleting,
  onDelete,
  texts,
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
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.65 : 1,
      }}
    >
      {isMain ? (
        <Tag className="uploaded-media-main-tag" color="purple">
          {texts.mainImageLabel}
        </Tag>
      ) : null}

      <Button
        type="text"
        size="small"
        className="uploaded-media-drag"
        icon={<DotsSixVerticalIcon size={16} />}
        {...attributes}
        {...listeners}
      />

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
    <Card>
      <Flex vertical gap={24}>
        <Flex vertical>
          <Title level={4} style={{ margin: 0 }}>
            {texts.title}
          </Title>

          <Text type="secondary">{texts.subtitle}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {texts.reorderHint}
          </Text>
        </Flex>

        <Flex gap={16} align="flex-start" wrap="wrap">
          <Spin spinning={productMediaUploadingCount > 0}>
            <Dragger
              name={PRODUCT_MEDIA_UPLOAD_FIELD_NAME}
              multiple={false}
              accept="image/png,image/jpeg,image/webp"
              showUploadList={false}
              beforeUpload={onBeforeUpload}
              customRequest={onUpload}
              style={{ width: 300 }}
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
              <Flex gap={16} align="flex-start" wrap="wrap">
                {uploadedProductMedia.map((media, index) => (
                  <SortableProductMediaPreview
                    key={media.id}
                    media={media}
                    isMain={index === 0}
                    deleting={deletingProductMediaId === media.id}
                    onDelete={onDelete}
                    texts={texts}
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
