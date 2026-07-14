import { PlusIcon } from "@phosphor-icons/react";
import { Avatar, Flex, Typography } from "antd";
import { useTranslation } from "react-i18next";

import { VariantWishlistBadge } from "@/features/products/components/variant-wishlist-badge/variant-wishlist-badge";
import type { CatalogVariant } from "@/features/products/model/product.types";
import { getCatalogVariantImageUrl } from "@/features/products/utils/catalog-variant-display";

import * as S from "../stock-supply-modal.styled";
import { getVariantMeta } from "../stock-supply-modal.utils";

const { Text } = Typography;

type SupplyVariantRowProps = {
  variant: CatalogVariant;
  onAdd: (variant: CatalogVariant) => void;
};

export const SupplyVariantRow = ({ variant, onAdd }: SupplyVariantRowProps) => {
  const { t } = useTranslation();
  const meta = getVariantMeta(variant);
  const imageUrl = getCatalogVariantImageUrl(variant);

  return (
    <S.VariantRow>
      <S.AddVariantButton
        type="button"
        aria-label={t("products.stockSupply.addVariantAria")}
        onClick={() => onAdd(variant)}
      >
        <PlusIcon size={16} />
      </S.AddVariantButton>
      <Avatar
        shape="square"
        size={34}
        src={imageUrl ?? undefined}
        style={{ flexShrink: 0 }}
      />
      <Flex vertical style={{ minWidth: 0 }}>
        <Flex align="center" gap={8} style={{ minWidth: 0 }}>
          <VariantWishlistBadge count={variant.wishlistCount} compact />
          <Text strong ellipsis>
            {variant.product.name}
          </Text>
        </Flex>
        {meta ? (
          <Text type="secondary" ellipsis style={{ fontSize: 12 }}>
            {meta}
          </Text>
        ) : null}
      </Flex>
      <Text
        strong
        type={variant.quantity <= 0 ? "danger" : undefined}
        style={{ whiteSpace: "nowrap" }}
      >
        {t("products.stockSupply.stockCount", { count: variant.quantity })}
      </Text>
    </S.VariantRow>
  );
};
