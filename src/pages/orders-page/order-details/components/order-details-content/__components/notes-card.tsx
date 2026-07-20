import { PencilSimpleIcon } from "@phosphor-icons/react";
import { Button, Card, Empty, Typography } from "antd";

import { formatText } from "../../../utils/order-details.utils";

import type { EditableSectionProps } from "../order-details-content.types";
import { InfoList } from "./info-list";

const { Paragraph } = Typography;

export const NotesCard = ({ order, t, onEdit }: EditableSectionProps) => {
  const hasNotes = Boolean(
    order.customerNote?.trim() || order.internalNote?.trim(),
  );

  return (
    <Card
      className="print-card"
      title={t("orders.notes")}
      extra={
        <Button
          className="no-print"
          icon={<PencilSimpleIcon size={18} />}
          onClick={() => onEdit("notes")}
        >
          {t("orders.details.editNotes")}
        </Button>
      }
    >
      {hasNotes ? (
        <InfoList
          items={[
            {
              key: "customerNote",
              label: t("orders.customerNote"),
              value: (
                <Paragraph style={{ marginBottom: 0, whiteSpace: "pre-wrap" }}>
                  {formatText(order.customerNote)}
                </Paragraph>
              ),
            },
            {
              key: "internalNote",
              label: t("orders.internalNote"),
              value: (
                <Paragraph style={{ marginBottom: 0, whiteSpace: "pre-wrap" }}>
                  {formatText(order.internalNote)}
                </Paragraph>
              ),
            },
          ]}
        />
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t("orders.noNotes")}
        />
      )}
    </Card>
  );
};
