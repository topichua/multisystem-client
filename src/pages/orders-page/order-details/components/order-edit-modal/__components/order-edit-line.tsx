import { TrashIcon } from "@phosphor-icons/react";
import { Button, Flex, InputNumber, Typography } from "antd";

import { VariantWishlistBadge } from "@/features/products/components/variant-wishlist-badge/variant-wishlist-badge";

import type { OrderDetails } from "@/features/orders/model/order.types";

import { formatMoney } from "../../../utils/order-details.utils";
import type { EditableOrderLine } from "../order-edit-modal.types";
import {
  getLineTotal,
  isLinePatchable,
  normalizeDiscountPercent,
  normalizeNonNegativeNumber,
  normalizePositiveInteger,
} from "../utils/order-edit-modal.utils";
import * as S from "../order-edit-modal.styled";

const { Text } = Typography;

type OrderEditLineProps = {
  order: OrderDetails;
  line: EditableOrderLine;
  t: ReturnType<typeof import("react-i18next").useTranslation>["t"];
  onUpdateLine: (lineKey: string, patch: Partial<EditableOrderLine>) => void;
  onRemoveLine: (lineKey: string) => void;
};

export const OrderEditLine = ({
  order,
  line,
  t,
  onUpdateLine,
  onRemoveLine,
}: OrderEditLineProps) => {
  const patchable = isLinePatchable(line);

  return (
    <S.EditLine $invalid={!patchable}>
      <S.EditLineImage
        shape="square"
        size={48}
        src={line.imageUrl ?? undefined}
      >
        {line.title.slice(0, 1)}
      </S.EditLineImage>

      <S.EditLineInfo>
        <Flex align="center" gap={8} style={{ minWidth: 0 }}>
          <VariantWishlistBadge count={line.wishlistCount ?? 0} compact />
          <S.EditLineName>{line.title}</S.EditLineName>
        </Flex>
        <S.EditLineMeta>
          {patchable ? line.meta : t("orders.details.editItemMissingRefs")}
        </S.EditLineMeta>
      </S.EditLineInfo>

      <S.EditLineControl>
        <Text type="secondary">{t("orders.quantity")}</Text>
        <InputNumber
          min={1}
          precision={0}
          controls={false}
          value={line.quantity}
          style={{ width: "100%" }}
          onChange={(value) =>
            onUpdateLine(line.key, {
              quantity: normalizePositiveInteger(value),
            })
          }
        />
      </S.EditLineControl>

      <S.EditLineControl>
        <Text type="secondary">{t("orders.details.lineDiscountPercent")}</Text>
        <InputNumber
          min={0}
          max={100}
          precision={0}
          controls={false}
          addonAfter="%"
          value={line.discountPercent}
          style={{ width: "100%" }}
          onChange={(value) =>
            onUpdateLine(line.key, {
              discountPercent: normalizeDiscountPercent(value),
              discountAmount:
                normalizeDiscountPercent(value) > 0 ? 0 : line.discountAmount,
            })
          }
        />
      </S.EditLineControl>

      <S.EditLineControl>
        <Text type="secondary">{t("orders.details.lineDiscountAmount")}</Text>
        <InputNumber
          min={0}
          controls={false}
          addonAfter={order.currency}
          value={line.discountAmount}
          style={{ width: "100%" }}
          onChange={(value) =>
            onUpdateLine(line.key, {
              discountAmount: normalizeNonNegativeNumber(value),
              discountPercent:
                normalizeNonNegativeNumber(value) > 0
                  ? 0
                  : line.discountPercent,
            })
          }
        />
      </S.EditLineControl>

      <S.EditLineTotal>
        <Text type="secondary">{t("orders.sum")}</Text>
        <Text strong>{formatMoney(getLineTotal(line), order.currency)}</Text>
      </S.EditLineTotal>

      <Button
        danger
        type="text"
        icon={<TrashIcon size={18} />}
        aria-label={t("orders.details.removeItem")}
        onClick={() => onRemoveLine(line.key)}
      />
    </S.EditLine>
  );
};
