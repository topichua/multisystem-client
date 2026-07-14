import { XIcon } from "@phosphor-icons/react";
import { Button, Flex, InputNumber, Typography } from "antd";
import { useTranslation } from "react-i18next";

import { VariantWishlistBadge } from "@/features/products/components/variant-wishlist-badge/variant-wishlist-badge";
import { formatCatalogVariantCurrency } from "@/features/products/utils/catalog-variant-display";

import * as S from "../stock-supply-modal.styled";
import type { SupplyLine } from "../stock-supply-modal.types";
import { getVariantMeta, toNumber } from "../stock-supply-modal.utils";

const { Text } = Typography;

type SupplySelectedLineProps = {
  line: SupplyLine;
  onUpdate: (
    variantId: number,
    patch: Partial<Omit<SupplyLine, "variant">>,
  ) => void;
  onRemove: (variantId: number) => void;
};

export const SupplySelectedLine = ({
  line,
  onUpdate,
  onRemove,
}: SupplySelectedLineProps) => {
  const { t } = useTranslation();
  const meta = getVariantMeta(line.variant);
  const currency = formatCatalogVariantCurrency(line.variant.product.currency);

  return (
    <S.SelectedLineRow>
      <Flex vertical style={{ minWidth: 0 }}>
        <Flex align="center" gap={8} style={{ minWidth: 0 }}>
          <VariantWishlistBadge count={line.variant.wishlistCount} compact />
          <Text strong ellipsis>
            {line.variant.product.name}
          </Text>
        </Flex>
        {meta ? (
          <Text type="secondary" ellipsis style={{ fontSize: 12 }}>
            {meta}
          </Text>
        ) : null}
      </Flex>
      <Text strong style={{ textAlign: "right" }}>
        {t("products.stockSupply.stockCount", {
          count: line.variant.quantity,
        })}
      </Text>
      <InputNumber
        min={0}
        precision={0}
        value={line.quantity}
        style={{ width: "100%" }}
        onChange={(value) =>
          onUpdate(line.variant.id, {
            quantity: toNumber(value),
          })
        }
      />
      <InputNumber
        min={0}
        precision={2}
        value={line.buyPrice}
        addonAfter={`${currency}/${t("products.inventoryDrawer.unit")}`}
        style={{ width: "100%" }}
        onChange={(value) =>
          onUpdate(line.variant.id, {
            buyPrice: toNumber(value),
          })
        }
      />
      <Button
        type="text"
        size="small"
        icon={<XIcon size={16} />}
        aria-label={t("products.stockSupply.removeVariantAria")}
        onClick={() => onRemove(line.variant.id)}
      />
    </S.SelectedLineRow>
  );
};
