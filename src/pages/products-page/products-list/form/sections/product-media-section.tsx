import { CloudArrowUpIcon, TrashIcon } from "@phosphor-icons/react";
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
  texts: {
    title: string;
    subtitle: string;
    dragUploadTitle: string;
    mainImageLabel: string;
    deleteTooltip: string;
    uploadHint: string;
  };
};

export const ProductMediaSection = ({
  uploadedProductMedia,
  productMediaUploadingCount,
  deletingProductMediaId,
  onBeforeUpload,
  onUpload,
  onDelete,
  texts,
}: ProductMediaSectionProps) => (
  <Card>
    <Flex vertical gap={24}>
      <Flex vertical>
        <Title level={4} style={{ margin: 0 }}>
          {texts.title}
        </Title>

        <Text type="secondary">{texts.subtitle}</Text>
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

        {uploadedProductMedia.map((media, index) => (
          <UploadedMediaPreview key={media.id} $isMain={index === 0}>
            {index === 0 ? (
              <Tag className="uploaded-media-main-tag" color="purple">
                {texts.mainImageLabel}
              </Tag>
            ) : null}

            <img src={media.src} alt="" />

            <Button
              type="text"
              danger
              size="small"
              className="uploaded-media-delete"
              icon={<TrashIcon size={16} />}
              aria-label={texts.deleteTooltip}
              loading={deletingProductMediaId === media.id}
              onClick={() => {
                onDelete(media.id);
              }}
            />
          </UploadedMediaPreview>
        ))}
      </Flex>
    </Flex>
  </Card>
);
