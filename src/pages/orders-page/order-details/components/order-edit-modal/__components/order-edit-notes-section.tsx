import { Form, Input, Typography } from "antd";

import * as S from "../../order-details-content/order-details-content.styled";

const { Text } = Typography;

type OrderEditNotesSectionProps = {
  t: ReturnType<typeof import("react-i18next").useTranslation>["t"];
};

export const OrderEditNotesSection = ({ t }: OrderEditNotesSectionProps) => (
  <S.EditSection>
    <S.EditSectionHeader>
      <Text strong>{t("orders.notes")}</Text>
      <Text type="secondary">{t("orders.details.notesEditableAnytime")}</Text>
    </S.EditSectionHeader>

    <Form.Item label={t("orders.customerNote")} name="customerNote">
      <Input.TextArea autoSize={{ minRows: 2, maxRows: 5 }} />
    </Form.Item>

    <Form.Item label={t("orders.internalNote")} name="internalNote">
      <Input.TextArea autoSize={{ minRows: 2, maxRows: 5 }} />
    </Form.Item>
  </S.EditSection>
);
