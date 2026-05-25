import { ImageSquareIcon, XIcon } from '@phosphor-icons/react';
import { Button, Flex, Form, Image, Typography, Upload } from 'antd';
import ImgCrop from 'antd-img-crop';
import { useTranslation } from 'react-i18next';

import { MEDIA_TILE_SIZE, type GalleryItem } from './product-gallery';

const { Dragger } = Upload;

type ProductGalleryFieldProps = {
  gallery: GalleryItem[];
  resolvedCoverId: string | null;
  onSelectCover: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
  onAddFile: (file: File) => void;
};

export const ProductGalleryField = ({
  gallery,
  resolvedCoverId,
  onSelectCover,
  onRemoveItem,
  onClearAll,
  onAddFile,
}: ProductGalleryFieldProps) => {
  const { t } = useTranslation();

  return (
    <Form.Item label={t('products.form.mediaUpload')}>
      <Flex vertical gap={8}>
        {gallery.length > 0 ? (
          <Typography.Text type="secondary">{t('products.media.coverPickHint')}</Typography.Text>
        ) : null}
        <Flex
          gap={12}
          align="stretch"
          wrap="nowrap"
          style={{ overflowX: 'auto', paddingBottom: 2 }}
        >
          {gallery.map((item) => (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              aria-pressed={resolvedCoverId === item.id}
              aria-label={t('products.media.coverPickHint')}
              onClick={() => onSelectCover(item.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectCover(item.id);
                }
              }}
              style={{
                position: 'relative',
                flex: '0 0 auto',
                width: MEDIA_TILE_SIZE,
                height: MEDIA_TILE_SIZE,
                boxSizing: 'border-box',
                padding: 4,
                borderRadius: 8,
                cursor: 'pointer',
                overflow: 'hidden',
                border:
                  resolvedCoverId === item.id
                    ? '2px solid var(--ant-color-primary, #1677ff)'
                    : '1px solid var(--ant-color-border, #d9d9d9)',
              }}
            >
              <Image
                src={item.previewUrl}
                width="100%"
                height="100%"
                style={{ objectFit: 'cover', display: 'block', borderRadius: 4 }}
                preview={false}
              />
              <Button
                type="text"
                size="small"
                icon={<XIcon size={14} weight="bold" />}
                aria-label={t('products.media.removeFromGallery')}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveItem(item.id);
                }}
                style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  zIndex: 1,
                  minWidth: 22,
                  width: 22,
                  height: 22,
                  padding: 0,
                  color: '#fff',
                  background: 'rgba(0, 0, 0, 0.55)',
                  borderRadius: '50%',
                }}
              />
            </div>
          ))}
          <div
            style={{
              flex: '0 0 auto',
              width: MEDIA_TILE_SIZE,
              height: MEDIA_TILE_SIZE,
              display: 'flex',
            }}
          >
            <ImgCrop
              aspect={1}
              quality={0.92}
              modalTitle={t('products.media.cropModalTitle')}
              modalOk={t('products.media.cropOk')}
              modalCancel={t('products.media.cropCancel')}
              zoomSlider
            >
              <Dragger
                accept="image/*"
                multiple
                showUploadList={false}
                beforeUpload={(file) => {
                  onAddFile(file);
                  return false;
                }}
              >
                <Flex
                  vertical
                  align="center"
                  justify="center"
                  gap={4}
                  aria-label={t('products.media.dragUploadTitle')}
                  style={{ pointerEvents: 'none' }}
                >
                  <ImageSquareIcon size={28} weight="duotone" aria-hidden />
                  <Typography.Text
                    type="secondary"
                    style={{ fontSize: 11, lineHeight: 1.2, textAlign: 'center' }}
                  >
                    {t('products.media.add')}
                  </Typography.Text>
                </Flex>
              </Dragger>
            </ImgCrop>
          </div>
        </Flex>
        {gallery.length > 0 ? (
          <Typography.Link onClick={onClearAll}>
            {t('products.media.clearAllImages')}
          </Typography.Link>
        ) : null}
      </Flex>
    </Form.Item>
  );
};
