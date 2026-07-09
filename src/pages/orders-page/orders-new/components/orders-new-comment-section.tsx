import { PencilSimpleIcon } from "@phosphor-icons/react";
import { Flex, Form, Input, Typography } from "antd";
import type { FormInstance } from "antd/es/form";
import { useTranslation } from "react-i18next";

import type { OrderFormValues } from "@/features/orders/model/order.types";

import { drawerKey } from "../orders-new.constants";
import * as S from "../orders-new-page.styled";
import { SectionHeading } from "./section-heading";

const { Text } = Typography;

type OrdersNewCommentSectionProps = {
  deliveryForm: FormInstance<OrderFormValues>;
};

export function OrdersNewCommentSection({
  deliveryForm,
}: OrdersNewCommentSectionProps) {
  const { t } = useTranslation();

  return (
    <S.SectionCard>
      <S.CardHeader>
        <SectionHeading icon={<PencilSimpleIcon size={18} />}>
          <Flex align="center" gap={8}>
            {t("orders.create.comment.title")}
            <Text type="secondary" style={{ fontWeight: 400 }}>
              {t(drawerKey("optional"))}
            </Text>
          </Flex>
        </SectionHeading>
      </S.CardHeader>
      <Form form={deliveryForm} layout="vertical">
        <Form.Item name="comment" noStyle>
          <Input.TextArea
            autoSize={{ minRows: 3, maxRows: 5 }}
            placeholder={t("orders.create.comment.placeholder")}
          />
        </Form.Item>
      </Form>
    </S.SectionCard>
  );
}
