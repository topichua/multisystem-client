import { useTranslation } from "react-i18next";
import styled from "styled-components";

const Badge = styled.span`
  flex-shrink: 0;
  padding: 2px 6px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.functional.background.hover};
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  line-height: 1.2;
  text-transform: uppercase;
`;

export const OrderStatusSystemBadge = () => {
  const { t } = useTranslation();

  return <Badge>{t("orderStatuses.systemBadge")}</Badge>;
};
