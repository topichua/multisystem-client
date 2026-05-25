import { PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';
import type { TableColumnsType } from 'antd';
import { Button, Flex, Popconfirm, Tag, Typography } from 'antd';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { Product } from '@/features/products/model/product.types';

type ProductStatusColor = 'default' | 'processing' | 'success' | 'warning' | 'error';

const { Text } = Typography;

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

type UseProductsTableColumnsParams = {
  categoryNameById: Map<number, string>;
  deleteLoading: boolean;
  onEdit: (productId: number) => void | Promise<void>;
  onDelete: (productId: number) => Promise<void>;
};

export const useProductsTableColumns = ({
  categoryNameById,
  deleteLoading,
  onEdit,
  onDelete,
}: UseProductsTableColumnsParams): TableColumnsType<Product> => {
  const { t } = useTranslation();

  return useMemo(
    () => [
      {
        title: t('products.table.product'),
        key: 'product',
        width: 360,
        render: (_, product) => (
          <Flex align="center" gap={12}>
            {product.mainImageUrl ? (
              <img
                src={product.mainImageUrl}
                alt={product.name}
                width={48}
                height={48}
                style={{
                  objectFit: 'cover',
                  borderRadius: 8,
                  backgroundColor: '#f2f2f2',
                  flexShrink: 0,
                }}
              />
            ) : (
              <div
                aria-hidden
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 8,
                  backgroundColor: '#f2f2f2',
                  flexShrink: 0,
                }}
              />
            )}
            <Flex vertical gap={2}>
              <Text strong ellipsis style={{ maxWidth: 260 }}>
                {product.name}
              </Text>
              <Text type="secondary" ellipsis style={{ maxWidth: 260 }}>
                {resolveSizesLabel(product.sizes, t('products.noSizes'))}
              </Text>
            </Flex>
          </Flex>
        ),
      },
      {
        title: t('products.table.category'),
        dataIndex: 'categoryId',
        key: 'categoryId',
        width: 100,
        render: (categoryId: Product['categoryId']) =>
          categoryId != null
            ? (categoryNameById.get(categoryId) ?? `#${categoryId}`)
            : t('products.noCategory'),
      },
      {
        title: t('products.table.price'),
        key: 'price',
        width: 100,
        render: (_, product) =>
          product.price != null
            ? `${product.price.toLocaleString()} ${product.currency}`
            : t('products.noPrice'),
      },
      {
        title: t('products.table.stock'),
        key: 'stock',
        width: 100,
        render: (_, product) => {
          if (product.inStock === false) {
            return t('products.outOfStock');
          }
          if (product.quantity == null) {
            return t('products.unknownQuantity');
          }

          return product.quantity;
        },
      },
      {
        title: t('products.table.status'),
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (status: string) => (
          <Tag color={statusToColor[status] ?? 'processing'}>{status}</Tag>
        ),
      },
      {
        title: t('products.table.actions'),
        key: 'actions',
        width: 50,
        render: (_, product) => (
          <Flex gap={4} align="center">
            <Button
              type="text"
              size="small"
              icon={<PencilSimpleIcon size={18} />}
              aria-label={t('products.edit')}
              onClick={(e) => {
                e.stopPropagation();
                void onEdit(product.id);
              }}
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
                onClick={(e) => e.stopPropagation()}
              />
            </Popconfirm>
          </Flex>
        ),
      },
    ],
    [categoryNameById, deleteLoading, onDelete, onEdit, t],
  );
};
