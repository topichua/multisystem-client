import type { CatalogVariant } from "@/features/products/model/product.types";
import { MinusIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { Button, Image, theme } from "antd";

import { VariantWishlistBadge } from "@/features/products/components/variant-wishlist-badge/variant-wishlist-badge";
import {
  formatCatalogVariantCurrency,
  getCatalogVariantImageUrl,
  getCatalogVariantMeta,
  getCatalogVariantUnitPrice,
} from "@/features/products/utils/catalog-variant-display";

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
  const imageUrl = getCatalogVariantImageUrl(variant) ?? undefined;
  const meta = getCatalogVariantMeta(variant);
  const currency = formatCatalogVariantCurrency(variant.product.currency);
  const maxQuantity = variant.quantity > 0 ? variant.quantity : undefined;
  const lineTotal = getCatalogVariantUnitPrice(variant) * quantity;
  const canDecrease = quantity > 1;
  const canIncrease = maxQuantity == null || quantity < maxQuantity;

  return (
    <S.ProductLine>
      <Image
        src={imageUrl}
        alt={variant.label}
        preview={false}
        width={40}
        height={40}
        style={{
          objectFit: "cover",
          borderRadius: token.borderRadiusSM,
          background: token.colorFillAlter,
          flexShrink: 0,
        }}
      />

      <S.ProductCopy>
        <S.ProductNameRow>
          <VariantWishlistBadge count={variant.wishlistCount} compact />
          <S.ProductName>{variant.label}</S.ProductName>
        </S.ProductNameRow>
        {meta && <S.ProductMeta>{meta}</S.ProductMeta>}
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
