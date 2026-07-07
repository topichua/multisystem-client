import type { CatalogVariant } from "@/features/products/model/product.types";
import { MinusIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { Button, Image, theme } from "antd";

import * as S from "./client-order-drawer.styled";

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
  const imageUrl =
    variant.imageUrl ?? variant.product.mainImageUrl ?? undefined;
  const meta = [variant.color, variant.size].filter(Boolean).join(" / ");
  const currency =
    variant.product.currency === "UAH" ? "₴" : variant.product.currency;
  const maxQuantity = variant.quantity > 0 ? variant.quantity : undefined;
  const lineTotal = variant.unitPrice * quantity;
  const canDecrease = quantity > 1;
  const canIncrease = maxQuantity == null || quantity < maxQuantity;

  return (
    <S.ProductLine>
      <Image
        src={imageUrl}
        alt={variant.label}
        preview={false}
        width={64}
        height={56}
        style={{
          objectFit: "cover",
          borderRadius: token.borderRadius,
          background: token.colorFillAlter,
          flexShrink: 0,
        }}
      />

      <S.ProductCopy>
        <S.ProductName>{variant.label}</S.ProductName>
        {meta ? <S.ProductMeta>{meta}</S.ProductMeta> : null}
      </S.ProductCopy>

      <S.QuantityStepper>
        <S.QuantityButton
          type="button"
          disabled={!canDecrease}
          aria-label="Decrease quantity"
          onClick={() => onQuantityChange(quantity - 1)}
        >
          <MinusIcon size={14} />
        </S.QuantityButton>
        <S.QuantityValue>{quantity}</S.QuantityValue>
        <S.QuantityButton
          type="button"
          disabled={!canIncrease}
          aria-label="Increase quantity"
          onClick={() => onQuantityChange(quantity + 1)}
        >
          <PlusIcon size={14} />
        </S.QuantityButton>
      </S.QuantityStepper>

      <S.ProductPrice>
        {lineTotal.toLocaleString("uk-UA")} {currency}
      </S.ProductPrice>

      <Button
        type="text"
        danger
        icon={<TrashIcon size={18} />}
        aria-label="Remove product"
        onClick={onRemove}
      />
    </S.ProductLine>
  );
};
