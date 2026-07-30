import { LockSimpleIcon } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.functional.background.hover};
  color: ${({ theme }) => theme.colors.functional.text.placeholder};
`;

export const OrderStatusSystemBadge = () => {
  const { t } = useTranslation();

  return (
    <Badge aria-label={t("orderStatuses.systemBadge")}>
      <LockSimpleIcon size={12} weight="bold" aria-hidden="true" />
    </Badge>
  );
};
