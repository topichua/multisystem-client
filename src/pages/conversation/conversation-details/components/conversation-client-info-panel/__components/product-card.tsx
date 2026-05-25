import { Card, Checkbox, Flex, Image, Typography, theme } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';

const { Text } = Typography;

type ProductCardProps = {
  title: string;
  imageUrl: string;
  size?: string;
  color?: string;
  price: number;
  currency?: string;
  stockCount?: number;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
};

export const ProductCard = ({
  title,
  imageUrl,
  size,
  color,
  price,
  currency = '₴',
  stockCount,
  checked,
  onChange,
}: ProductCardProps) => {
  const { token } = theme.useToken();

  const handleChange = (event: CheckboxChangeEvent) => {
    onChange?.(event.target.checked);
  };

  const meta = [size, color].filter(Boolean).join(' / ');

  return (
    <Card
      hoverable
      style={{
        background: 'transparent',
      }}
      styles={{
        root: {
          borderColor: '#e2e1e1',
        },
        body: {
          padding: 8,
        },
      }}
    >
      <Flex align="center" gap={16}>
        <Image
          src={imageUrl}
          alt={title}
          preview={false}
          width={96}
          height={80}
          style={{
            objectFit: 'cover',
            borderRadius: token.borderRadius,
            background: token.colorFillAlter,
          }}
        />

        <Flex vertical gap={6} style={{ flex: 1, minWidth: 0 }}>
          <Text strong ellipsis>
            {title}
          </Text>

          {meta && (
            <Text type="secondary" ellipsis>
              {meta}
            </Text>
          )}

          <Text strong style={{ fontSize: token.fontSizeHeading4 }}>
            {price.toLocaleString('uk-UA')} {currency}
          </Text>

          {typeof stockCount === 'number' && (
            <Text type="secondary">В наявності ({stockCount} шт.)</Text>
          )}
        </Flex>

        <Checkbox checked={checked} onChange={handleChange} />
      </Flex>
    </Card>
  );
};
