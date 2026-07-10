import { Alert, Empty, Flex, Form, InputNumber, Typography } from 'antd';
import type { FormInstance } from 'antd';

import type { OrderDetails } from '@/features/orders/model/order.types';
import { ProductSearchPopover } from '@/pages/orders-page/orders-new/components/orders-new-products-section/product-search-popover';
import type { CatalogVariant } from '@/features/products/model/product.types';

import type {
  EditableOrderLine,
  OrderEditFormValues,
} from '../order-edit-modal.types';
import {
  normalizeDiscountPercent,
  normalizeNonNegativeNumber,
} from '../utils/order-edit-modal.utils';
import { OrderEditLine } from './order-edit-line';
import * as S from '../../order-details-content/order-details-content.styled';

const { Text } = Typography;

type OrderEditItemsSectionProps = {
  order: OrderDetails;
  t: ReturnType<typeof import('react-i18next').useTranslation>['t'];
  form: FormInstance<OrderEditFormValues>;
  canEditItems: boolean;
  editItemsAllowed: boolean;
  lines: EditableOrderLine[];
  hasUnpatchableLines: boolean;
  productSearchOpen: boolean;
  productSearchValue: string;
  trimmedProductSearch: string;
  catalogSearchLoading: boolean;
  catalogSearchResults: CatalogVariant[];
  selectedVariantIds: Set<number>;
  onProductSearchOpen: () => void;
  onProductSearchClose: () => void;
  onProductSearchChange: (value: string) => void;
  onVariantSelect: (variant: CatalogVariant) => void;
  onUpdateLine: (lineKey: string, patch: Partial<EditableOrderLine>) => void;
  onRemoveLine: (lineKey: string) => void;
};

export const OrderEditItemsSection = ({
  order,
  t,
  form,
  canEditItems,
  editItemsAllowed,
  lines,
  hasUnpatchableLines,
  productSearchOpen,
  productSearchValue,
  trimmedProductSearch,
  catalogSearchLoading,
  catalogSearchResults,
  selectedVariantIds,
  onProductSearchOpen,
  onProductSearchClose,
  onProductSearchChange,
  onVariantSelect,
  onUpdateLine,
  onRemoveLine,
}: OrderEditItemsSectionProps) => (
  <>
    {!canEditItems && (
      <Alert
        type="info"
        showIcon
        message={t('orders.details.itemsEditLockedTitle')}
        description={t('orders.details.itemsEditLockedText')}
      />
    )}

    {editItemsAllowed && (
      <S.EditSection>
        <S.EditSectionHeader>
          <Flex align="center" gap={8} wrap>
            <Text strong>{t('orders.productsTab')}</Text>
            <S.CountBadge>{lines.length}</S.CountBadge>
          </Flex>

          <ProductSearchPopover
            open={productSearchOpen}
            value={productSearchValue}
            loading={catalogSearchLoading}
            results={catalogSearchResults}
            selectedVariantIds={selectedVariantIds}
            trimmedSearch={trimmedProductSearch}
            onOpen={onProductSearchOpen}
            onClose={onProductSearchClose}
            onChange={onProductSearchChange}
            onVariantSelect={onVariantSelect}
          />
        </S.EditSectionHeader>

        {hasUnpatchableLines && (
          <Alert
            type="warning"
            showIcon
            title={t('orders.details.editItemsMissingRefs')}
            description={t('orders.details.editItemsMissingRefsText')}
          />
        )}

        {lines.length && (
          <S.EditLines>
            {lines.map((line) => (
              <OrderEditLine
                key={line.key}
                order={order}
                line={line}
                t={t}
                onUpdateLine={onUpdateLine}
                onRemoveLine={onRemoveLine}
              />
            ))}
          </S.EditLines>
        )}
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t('orders.create.products.emptyState')}
        />

        <S.EditDiscountGrid>
          <Form.Item
            label={t('orders.details.discountAmount')}
            name="discountAmount"
          >
            <InputNumber
              min={0}
              controls={false}
              addonAfter={order.currency}
              style={{ width: '100%' }}
              onChange={(value) => {
                if (normalizeNonNegativeNumber(value) > 0) {
                  form.setFieldValue('discountPercent', 0);
                }
              }}
            />
          </Form.Item>

          <Form.Item
            label={t('orders.details.discountPercent')}
            name="discountPercent"
          >
            <InputNumber
              min={0}
              max={100}
              precision={0}
              controls={false}
              addonAfter="%"
              style={{ width: '100%' }}
              onChange={(value) => {
                if (normalizeDiscountPercent(value) > 0) {
                  form.setFieldValue('discountAmount', 0);
                }
              }}
            />
          </Form.Item>
        </S.EditDiscountGrid>
      </S.EditSection>
    )}
  </>
);
