import {
  CaretRightIcon,
  FlowArrowIcon,
  ReceiptIcon,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { ordersSectionNavItems } from "@/app/router/navigation";

import * as S from "./mobile-orders-hub-page.styled";

type OrdersMobileItemKey = (typeof ordersSectionNavItems)[number]["key"];

type OrdersMobilePresentation = {
  icon: ReactNode;
  descriptionKey: string;
};

const ordersMobilePresentationByKey = {
  "orders-list": {
    icon: <ReceiptIcon />,
    descriptionKey: "orders.mobile.descriptions.list",
  },
  "orders-statuses": {
    icon: <FlowArrowIcon />,
    descriptionKey: "orders.mobile.descriptions.statuses",
  },
} satisfies Record<OrdersMobileItemKey, OrdersMobilePresentation>;

export const MobileOrdersHubPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <S.Root>
      <S.Header>
        <S.PageTitle level={3}>{t("orders.shellTitle")}</S.PageTitle>
      </S.Header>

      <S.ListCard>
        {ordersSectionNavItems.map((item) => {
          const presentation = ordersMobilePresentationByKey[item.key];

          return (
            <S.ItemButton
              key={item.key}
              type="text"
              block
              data-qa={`orders-mobile-hub-item-${item.key}`}
              onClick={() => navigate(item.path)}
            >
              <S.ItemContent align="center" gap={12}>
                <S.IconTile aria-hidden="true">{presentation.icon}</S.IconTile>
                <S.ItemCopy vertical gap={2}>
                  <S.ItemTitle>{t(item.labelKey)}</S.ItemTitle>
                  <S.ItemDescription>
                    {t(presentation.descriptionKey)}
                  </S.ItemDescription>
                </S.ItemCopy>
                <S.Caret aria-hidden="true">
                  <CaretRightIcon size={18} />
                </S.Caret>
              </S.ItemContent>
            </S.ItemButton>
          );
        })}
      </S.ListCard>
    </S.Root>
  );
};
