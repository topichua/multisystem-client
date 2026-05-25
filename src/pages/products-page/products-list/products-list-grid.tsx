import type { MouseEvent } from 'react';

import { PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';
import { Button, Card, Col, Empty, Flex, Popconfirm, Row, Spin, Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import type { Product } from '@/features/products/model/product.types';

const { Text } = Typography;

type ProductStatusColor = 'default' | 'processing' | 'success' | 'warning' | 'error';

const statusToColor: Record<string, ProductStatusColor> = {
  draft: 'default',
  active: 'success',
  archived: 'warning',
};

const resolveSizesLabel = (value: Product['sizes'], fallback: string): string => {
  if (Array.isArray(value)) {
    const cleaned = value.filter((size) => typeof size === 'string' && size.trim().length > 0);
    return cleaned.length > 0 ? cleaned.join(', ') : fallback;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }

  return fallback;
};

type ProductsListGridProps = {
  products: Product[];
  loading: boolean;
  categoryNameById: Map<number, string>;
  onOpenProduct: (product: Product) => (event: MouseEvent<HTMLElement>) => void;
  onEdit: (productId: number) => void;
  onDelete: (productId: number) => Promise<void>;
  deleteLoading: boolean;
};

export const ProductsListGrid = ({
  products,
  loading,
  categoryNameById,
  onOpenProduct,
  onEdit,
  onDelete,
  deleteLoading,
}: ProductsListGridProps) => {
  const { t } = useTranslation();

  const handleCardClick =
    (product: Product) =>
    (event: MouseEvent<HTMLDivElement>): void => {
      const target = event.target as HTMLElement;
      if (target.closest('button') || target.closest('a') || target.closest('.ant-popconfirm')) {
        return;
      }
      onOpenProduct(product)(event as unknown as MouseEvent<HTMLElement>);
    };

  return (
    <Spin spinning={loading}>
      {products.length === 0 && !loading ? (
        <Empty />
      ) : (
        <Row gutter={[16, 16]}>
          {products.map((product) => (
            <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
              <Card
                hoverable
                styles={{ body: { padding: 12 } }}
                onClick={handleCardClick(product)}
                cover={
                  <div
                    style={{
                      height: 160,
                      background: '#f5f5f5',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {product.mainImageUrl ? (
                      <img
                        src={product.mainImageUrl}
                        alt=""
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : null}
                  </div>
                }
              >
                <Flex vertical gap={8}>
                  <Text strong ellipsis={{ tooltip: product.name }}>
                    {product.name}
                  </Text>
                  <Text type="secondary" ellipsis style={{ fontSize: 12 }}>
                    {resolveSizesLabel(product.sizes, t('products.noSizes'))}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {product.categoryId != null
                      ? (categoryNameById.get(product.categoryId) ?? `#${product.categoryId}`)
                      : t('products.noCategory')}
                  </Text>
                  <Text>
                    {product.price != null
                      ? `${product.price.toLocaleString()} ${product.currency}`
                      : t('products.noPrice')}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {product.inStock === false
                      ? t('products.outOfStock')
                      : product.quantity == null
                        ? t('products.unknownQuantity')
                        : String(product.quantity)}
                  </Text>
                  <Tag
                    color={statusToColor[product.status] ?? 'processing'}
                    style={{ width: 'fit-content' }}
                  >
                    {product.status}
                  </Tag>
                  <Flex gap={4} wrap="wrap" align="center" onClick={(e) => e.stopPropagation()}>
                    <Button
                      type="text"
                      size="small"
                      icon={<PencilSimpleIcon size={18} />}
                      aria-label={t('products.edit')}
                      onClick={() => void onEdit(product.id)}
                    />
                    <Popconfirm
                      title={t('products.deleteConfirm')}
                      onConfirm={() => void onDelete(product.id)}
                    >
                      <Button
                        type="text"
                        size="small"
                        danger
                        loading={deleteLoading}
                        icon={<TrashIcon size={18} />}
                        aria-label={t('products.delete')}
                      />
                    </Popconfirm>
                  </Flex>
                </Flex>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Spin>
  );
};
