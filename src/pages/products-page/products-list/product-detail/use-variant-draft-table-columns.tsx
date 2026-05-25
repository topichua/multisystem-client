import { Button, Flex, Image, Input, InputNumber, Popconfirm, Switch, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { ProductVariantDraft } from '@/features/products/model/product.types';

import {
  VARIANT_DRAFT_TABLE_COLUMN_WIDTHS,
  variantDraftCellFieldStyle,
} from './variant-draft-table-layout';
import { parseVariantRowKey } from './variant-draft-utils';

type UseVariantDraftTableColumnsParams = {
  currency: string;
  isRowEditing: (clientId: string) => boolean;
  onUpdateDraft: (clientId: string, patch: Partial<ProductVariantDraft>) => void;
  onSaveDraft: (clientId: string) => void | Promise<void>;
  onStartEditDraft: (clientId: string) => void;
  onDeleteDraft: (clientId: string) => void | Promise<void>;
  variantSaveLoading?: boolean;
  variantSavingClientId?: string | null;
  variantDeleteLoadingId?: number | null;
  autoSaveOnBlur?: boolean;
  onFieldBlur?: (clientId: string) => void;
  onOpenImagePicker?: (clientId: string) => void;
};

export const useVariantDraftTableColumns = ({
  currency,
  isRowEditing,
  onUpdateDraft,
  onSaveDraft,
  onStartEditDraft,
  onDeleteDraft,
  variantSaveLoading = false,
  variantSavingClientId = null,
  variantDeleteLoadingId = null,
  autoSaveOnBlur = false,
  onFieldBlur,
  onOpenImagePicker,
}: UseVariantDraftTableColumnsParams): ColumnsType<ProductVariantDraft> => {
  const { t } = useTranslation();

  return useMemo(() => {
    const triggerFieldBlur = (clientId: string) => {
      if (autoSaveOnBlur) {
        onFieldBlur?.(clientId);
      }
    };

    return [
      {
        title: '',
        key: 'mainImageUrl',
        width: VARIANT_DRAFT_TABLE_COLUMN_WIDTHS.image,
        render: (_: unknown, row: ProductVariantDraft) => {
          const editing = isRowEditing(row.clientId);

          return (
            <Flex
              vertical
              gap={4}
              align="center"
              style={{ width: VARIANT_DRAFT_TABLE_COLUMN_WIDTHS.image }}
            >
              {row.imageFile ? (
                <Image src={URL.createObjectURL(row.imageFile as File)} width={50} />
              ) : row.imageUrl ? (
                <Image src={row.imageUrl} width={50} style={{ objectFit: 'cover' }} />
              ) : null}
              {editing ? (
                <Button
                  type="link"
                  size="small"
                  disabled={!onOpenImagePicker}
                  style={{ padding: 0, height: 'auto' }}
                  onClick={() => onOpenImagePicker?.(row.clientId)}
                >
                  {t('products.variant.upload')}
                </Button>
              ) : null}
            </Flex>
          );
        },
      },
      {
        title: t('products.variant.color'),
        key: 'color',
        width: VARIANT_DRAFT_TABLE_COLUMN_WIDTHS.color,
        render: (_: unknown, row: ProductVariantDraft) =>
          isRowEditing(row.clientId) ? (
            <Input
              size="small"
              value={row.color}
              placeholder={t('products.variant.color')}
              style={variantDraftCellFieldStyle}
              onChange={(event) => onUpdateDraft(row.clientId, { color: event.target.value })}
              onBlur={() => triggerFieldBlur(row.clientId)}
            />
          ) : (
            row.color || t('products.variantDash')
          ),
      },
      {
        title: t('products.variant.size'),
        key: 'size',
        width: VARIANT_DRAFT_TABLE_COLUMN_WIDTHS.size,
        render: (_: unknown, row: ProductVariantDraft) =>
          isRowEditing(row.clientId) ? (
            <Input
              size="small"
              value={row.size}
              placeholder={t('products.variant.size')}
              style={variantDraftCellFieldStyle}
              onChange={(event) => onUpdateDraft(row.clientId, { size: event.target.value })}
              onBlur={() => triggerFieldBlur(row.clientId)}
            />
          ) : (
            row.size || t('products.variantDash')
          ),
      },
      {
        title: t('products.variant.price'),
        key: 'price',
        width: VARIANT_DRAFT_TABLE_COLUMN_WIDTHS.price,
        render: (_: unknown, row: ProductVariantDraft) =>
          isRowEditing(row.clientId) ? (
            <InputNumber
              size="small"
              min={0}
              value={row.price}
              addonAfter={currency}
              style={variantDraftCellFieldStyle}
              onChange={(value) => onUpdateDraft(row.clientId, { price: value ?? 0 })}
              onBlur={() => triggerFieldBlur(row.clientId)}
            />
          ) : (
            `${row.price.toLocaleString()} ${currency}`
          ),
      },
      {
        title: t('products.variant.quantity'),
        key: 'quantity',
        width: VARIANT_DRAFT_TABLE_COLUMN_WIDTHS.quantity,
        render: (_: unknown, row: ProductVariantDraft) =>
          isRowEditing(row.clientId) ? (
            <InputNumber
              size="small"
              min={0}
              value={row.quantity}
              style={variantDraftCellFieldStyle}
              onChange={(value) => onUpdateDraft(row.clientId, { quantity: value ?? 0 })}
              onBlur={() => triggerFieldBlur(row.clientId)}
            />
          ) : (
            row.quantity
          ),
      },
      {
        title: t('products.variant.inStock'),
        key: 'inStock',
        width: VARIANT_DRAFT_TABLE_COLUMN_WIDTHS.inStock,
        render: (_: unknown, row: ProductVariantDraft) =>
          isRowEditing(row.clientId) ? (
            <Switch
              size="small"
              checked={row.inStock}
              onChange={(checked) => {
                onUpdateDraft(row.clientId, { inStock: checked });
                if (autoSaveOnBlur) {
                  onFieldBlur?.(row.clientId);
                }
              }}
            />
          ) : row.inStock ? (
            t('products.yes')
          ) : (
            t('products.no')
          ),
      },
      {
        title: t('products.table.actions'),
        key: 'actions',
        width: VARIANT_DRAFT_TABLE_COLUMN_WIDTHS.actions,
        align: 'right' as const,
        render: (_: unknown, row: ProductVariantDraft) => {
          const persistedVariantId = parseVariantRowKey(row.clientId);

          if (isRowEditing(row.clientId)) {
            if (autoSaveOnBlur) {
              const rowSaving = variantSavingClientId === row.clientId;

              return (
                <Flex
                  justify="flex-end"
                  align="center"
                  style={{ width: VARIANT_DRAFT_TABLE_COLUMN_WIDTHS.actions, minHeight: 32 }}
                >
                  {rowSaving ? (
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {t('products.saving')}
                    </Typography.Text>
                  ) : null}
                </Flex>
              );
            }

            return (
              <Flex justify="flex-end" style={{ width: VARIANT_DRAFT_TABLE_COLUMN_WIDTHS.actions }}>
                <Button
                  type="link"
                  size="small"
                  loading={variantSaveLoading}
                  onClick={() => void onSaveDraft(row.clientId)}
                >
                  {t('products.save')}
                </Button>
              </Flex>
            );
          }

          return (
            <Flex
              gap={4}
              justify="flex-end"
              style={{ width: VARIANT_DRAFT_TABLE_COLUMN_WIDTHS.actions }}
            >
              <Button
                type="text"
                size="small"
                icon={<PencilSimpleIcon size={18} />}
                aria-label={t('products.edit')}
                onClick={() => onStartEditDraft(row.clientId)}
              />
              <Popconfirm
                title={t('products.variantDeleteConfirm')}
                onConfirm={() => void onDeleteDraft(row.clientId)}
              >
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<TrashIcon size={18} />}
                  aria-label={t('products.delete')}
                  loading={
                    persistedVariantId != null && variantDeleteLoadingId === persistedVariantId
                  }
                />
              </Popconfirm>
            </Flex>
          );
        },
      },
    ];
  }, [
    currency,
    isRowEditing,
    onDeleteDraft,
    onSaveDraft,
    onStartEditDraft,
    onUpdateDraft,
    t,
    autoSaveOnBlur,
    onFieldBlur,
    onOpenImagePicker,
    variantDeleteLoadingId,
    variantSaveLoading,
    variantSavingClientId,
  ]);
};
