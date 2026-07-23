import { CaretRightIcon } from "@phosphor-icons/react";
import { Flex } from "antd";

import type { TranslationFn } from "../../../order-details-content.types";
import { PAYMENT_COLLECTION_METHODS } from "../model/payment-card.constants";
import type { PaymentCollectionMethod } from "../model/payment-card.types";
import * as S from "../payment-card.styled";

type PaymentCollectionPanelProps = {
  t: TranslationFn;
  onSelectMethod: (method: PaymentCollectionMethod) => void;
  onCancel: () => void;
};

export function PaymentCollectionPanel({
  t,
  onSelectMethod,
  onCancel,
}: PaymentCollectionPanelProps) {
  return (
    <Flex vertical gap={12}>
      <S.MethodList role="list">
        {PAYMENT_COLLECTION_METHODS.map(({ key, labelKey, icon: Icon }) => (
          <li key={key}>
            <S.MethodButton type="button" onClick={() => onSelectMethod(key)}>
              <Flex align="center" gap={10}>
                <S.MethodIcon aria-hidden="true">
                  <Icon size={18} />
                </S.MethodIcon>
                <S.MethodLabel>{t(labelKey)}</S.MethodLabel>
              </Flex>
              <CaretRightIcon aria-hidden="true" size={16} />
            </S.MethodButton>
          </li>
        ))}
      </S.MethodList>

      <S.CancelButton type="button" onClick={onCancel}>
        {t("orders.details.cancel")}
      </S.CancelButton>
    </Flex>
  );
}
