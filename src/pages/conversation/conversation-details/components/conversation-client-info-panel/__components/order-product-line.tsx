import type { CatalogVariant } from '@/features/products/model/product.types';
import { TrashIcon } from '@phosphor-icons/react';
import { Button, Flex, Image, InputNumber, Typography, theme } from 'antd';

const { Text } = Typography;

type OrderProductLineProps = {
  variant: CatalogVariant;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
};

export const OrderProductLine = ({
  variant,
  quantity,
  onQuantityChange,
  onRemove,
}: OrderProductLineProps) => {
  const { token } = theme.useToken();
  const imageUrl = variant.imageUrl ?? variant.product.mainImageUrl ?? undefined;
  const meta = [variant.color, variant.size].filter(Boolean).join(' / ');
  const currency = variant.product.currency === 'UAH' ? '₴' : variant.product.currency;

  return (
    <Flex align="center" gap={12}>
      <Image
        src={imageUrl}
        alt={variant.label}
        preview={false}
        width={64}
        height={56}
        style={{
          objectFit: 'cover',
          borderRadius: token.borderRadius,
          background: token.colorFillAlter,
          flexShrink: 0,
        }}
      />

      <Flex vertical gap={4} style={{ flex: 1, minWidth: 0 }}>
        <Text strong ellipsis>
          {variant.label}
        </Text>
        {meta ? (
          <Text type="secondary" ellipsis>
            {meta}
          </Text>
        ) : null}
        <Text strong>
          {variant.unitPrice.toLocaleString('uk-UA')} {currency}
        </Text>
      </Flex>

      <InputNumber
        min={1}
        max={variant.quantity > 0 ? variant.quantity : undefined}
        value={quantity}
        onChange={(value) => {
          if (typeof value === 'number' && value >= 1) {
            onQuantityChange(value);
          }
        }}
        style={{ width: 72, flexShrink: 0 }}
      />

      <Button
        type="text"
        danger
        icon={<TrashIcon size={18} />}
        aria-label="Remove product"
        onClick={onRemove}
      />
    </Flex>
  );
};
