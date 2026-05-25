import { ImageSquareIcon } from '@phosphor-icons/react';
import { Button, Flex, Image, Modal, Spin, Typography, Upload } from 'antd';
import ImgCrop from 'antd-img-crop';
import { useTranslation } from 'react-i18next';

import type { ProductGalleryImage } from './product-gallery-images';
import { variantNestedModalStyles } from './modal-style-tokens';

const THUMB_SIZE = 88;

type VariantImagePickerModalProps = {
  open: boolean;
  images: ProductGalleryImage[];
  selectedUrl?: string;
  uploadLoading?: boolean;
  onClose: () => void;
  onSelect: (url: string, uploadedFile?: File) => void;
  onUploadNew: (file: File) => Promise<string | null>;
};

export const VariantImagePickerModal = ({
  open,
  images,
  selectedUrl,
  uploadLoading = false,
  onClose,
  onSelect,
  onUploadNew,
}: VariantImagePickerModalProps) => {
  const { t } = useTranslation();

  const handlePick = (url: string, uploadedFile?: File) => {
    onSelect(url, uploadedFile);
    onClose();
  };

  return (
    <Modal
      title={t('products.variant.imagePickerTitle')}
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      width={560}
      styles={variantNestedModalStyles}
    >
      <Flex vertical gap={16}>
        {images.length > 0 ? (
          <Flex vertical gap={8}>
            <Typography.Text type="secondary">
              {t('products.variant.imagePickerExisting')}
            </Typography.Text>
            <Flex gap={12} wrap="wrap">
              {images.map((image) => {
                const isSelected = selectedUrl === image.url;

                return (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => handlePick(image.url)}
                    style={{
                      padding: 8,
                      borderRadius: 8,
                      border: isSelected
                        ? '2px solid var(--ant-color-primary, #1677ff)'
                        : '1px solid var(--ant-color-border, #d9d9d9)',
                      background: 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    <Image
                      src={image.url}
                      width={THUMB_SIZE}
                      height={THUMB_SIZE}
                      style={{ objectFit: 'cover', display: 'block' }}
                      preview={false}
                    />
                  </button>
                );
              })}
            </Flex>
          </Flex>
        ) : (
          <Typography.Text type="secondary">
            {t('products.variant.imagePickerEmpty')}
          </Typography.Text>
        )}

        <Flex vertical gap={8} align="flex-start">
          <Typography.Text type="secondary">
            {t('products.variant.imagePickerUploadNew')}
          </Typography.Text>
          <Spin spinning={uploadLoading}>
            <ImgCrop
              aspect={1}
              quality={0.92}
              modalTitle={t('products.media.cropModalTitle')}
              modalOk={t('products.media.cropOk')}
              modalCancel={t('products.media.cropCancel')}
              zoomSlider
            >
              <Upload
                accept="image/*"
                showUploadList={false}
                disabled={uploadLoading}
                beforeUpload={(file) => {
                  void (async () => {
                    const url = await onUploadNew(file);
                    if (url) {
                      handlePick(url, file);
                    }
                  })();
                  return false;
                }}
              >
                <Button icon={<ImageSquareIcon size={18} />}>
                  {t('products.media.uploadSelect')}
                </Button>
              </Upload>
            </ImgCrop>
          </Spin>
        </Flex>
      </Flex>
    </Modal>
  );
};
