import { ArrowSquareOutIcon, InstagramLogoIcon } from "@phosphor-icons/react";
import { Avatar } from "antd";

import { pagesMap } from "@/app/router/pages-map";

import {
  getCustomerInitials,
  getOrderSourceLabel,
} from "../../../utils/order-details.utils";

import type { CustomerSectionProps } from "../order-details-content.types";
import { CopyableText, InfoList } from "./info-list";
import * as S from "../order-details-content.styled";

export const CustomerCard = ({
  order,
  customerName,
  t,
}: CustomerSectionProps) => (
  <S.DetailsCard className="print-card section-customer">
    <S.CardHeader>
      <S.CardTitle level={3}>{t("orders.customer")}</S.CardTitle>
    </S.CardHeader>

    <S.CustomerHeader>
      <Avatar size={44}>{getCustomerInitials(order.customer)}</Avatar>

      <S.CustomerIdentity>
        <S.CustomerName>{customerName}</S.CustomerName>

        <S.CustomerSource>
          <InstagramLogoIcon size={16} />
          {getOrderSourceLabel(t, order.source)}
        </S.CustomerSource>
      </S.CustomerIdentity>
    </S.CustomerHeader>

    <InfoList
      items={[
        {
          key: "phone",
          label: t("orders.phone"),
          value: <CopyableText value={order.customer.phone} />,
        },
        {
          key: "source",
          label: t("orders.source"),
          value: getOrderSourceLabel(t, order.source),
        },
        {
          key: "customerId",
          label: t("orders.customerId"),
          value: order.customer.id,
        },
      ]}
    />

    <S.ProfileLink className="no-print" href={pagesMap.clientsWorkspace}>
      <ArrowSquareOutIcon size={16} />
      {t("orders.details.clientProfile")}
    </S.ProfileLink>
  </S.DetailsCard>
);
