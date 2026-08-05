import { Alert, Button, Card, Col, Row, Skeleton, Typography } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { ClientOrderStats } from "@/features/orders/model/order.types";
import { formatMoney } from "@/features/orders/utils/format-money";
import { formatDate } from "@/utils/date-time";

const { Text, Title } = Typography;

type ClientDetailsStatsProps = {
  stats: ClientOrderStats | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
};

export function ClientDetailsStats({
  stats,
  loading,
  error,
  onRetry,
}: ClientDetailsStatsProps) {
  const { t } = useTranslation();

  const cards = useMemo(
    () => [
      {
        key: "orderCount",
        label: t("clients.details.stats.orders"),
        value: stats ? String(stats.orderCount) : "—",
      },
      {
        key: "totalSpent",
        label: t("clients.details.stats.totalSpent"),
        value: stats ? formatMoney(stats.totalSpent) : "—",
      },
      {
        key: "averageOrderPrice",
        label: t("clients.details.stats.averageCheck"),
        value: stats ? formatMoney(stats.averageOrderPrice) : "—",
      },
      {
        key: "lastOrderAt",
        label: t("clients.details.stats.lastOrder"),
        value: formatDate(stats?.lastOrderAt ?? "") || "—",
      },
    ],
    [stats, t],
  );

  if (loading) {
    return (
      <Row gutter={[12, 12]}>
        {cards.map((card) => (
          <Col key={card.key} xs={24} sm={12} lg={6}>
            <Card size="small">
              <Skeleton.Input
                active
                size="small"
                style={{ width: "70%", marginBottom: 8 }}
              />
              <Skeleton.Input active size="small" style={{ width: "50%" }} />
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  if (error) {
    return (
      <Alert
        type="error"
        showIcon
        title={error}
        action={
          <Button size="small" onClick={onRetry}>
            {t("clients.details.retry")}
          </Button>
        }
      />
    );
  }

  return (
    <Row gutter={[12, 12]}>
      {cards.map((card) => (
        <Col key={card.key} xs={24} sm={12} lg={6}>
          <Card size="small">
            <Title level={3} style={{ margin: "0 0 4px" }}>
              {card.value}
            </Title>
            <Text type="secondary">{card.label}</Text>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
