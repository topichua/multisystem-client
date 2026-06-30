import { Col, Divider, Flex, Row, Typography } from "antd";
import { useTranslation } from "react-i18next";

import { compactValue } from "./nova-poshta-integration-card.helpers";
import type { NovaPoshtaIntegrationDetailsViewProps } from "./nova-poshta-integration-card.types";

const { Text } = Typography;

type DetailFieldProps = {
  label: string;
  value?: string | null;
  fallback: string;
};

function DetailField({ label, value, fallback }: DetailFieldProps) {
  const displayValue = value?.trim() || fallback;

  return (
    <Flex vertical gap={4}>
      <Text type="secondary">{label}</Text>
      <Text>{displayValue}</Text>
    </Flex>
  );
}

function DetailColumn(props: DetailFieldProps) {
  return (
    <Col xs={24} md={12}>
      <DetailField {...props} />
    </Col>
  );
}

export function NovaPoshtaIntegrationDetailsView({
  details,
}: NovaPoshtaIntegrationDetailsViewProps) {
  const { t } = useTranslation();
  const emptyValue = t("integrations.novaPoshtaDetails.emptyValue");
  const senderTypeLabel =
    details.sender_type === "address"
      ? t("integrations.novaPoshtaWizard.senderTypes.address")
      : t("integrations.novaPoshtaWizard.senderTypes.warehouse");
  const payerTypeLabel =
    details.payer_type === "recipient"
      ? t("integrations.novaPoshtaWizard.payerTypes.recipient")
      : t("integrations.novaPoshtaWizard.payerTypes.sender");
  const senderLabel = compactValue([details.sender_name, details.sender_phone]);

  return (
    <Flex vertical gap={16}>
      <Flex vertical gap={12}>
        <Text strong>
          {t("integrations.novaPoshtaDetails.sections.sender")}
        </Text>
        <Row gutter={[24, 12]}>
          <DetailColumn
            label={t("integrations.novaPoshtaWizard.fields.sender.label")}
            value={senderLabel}
            fallback={emptyValue}
          />
          <DetailColumn
            label={t("integrations.novaPoshtaWizard.fields.city.label")}
            value={details.sender_city_name}
            fallback={emptyValue}
          />
          <DetailColumn
            label={t("integrations.novaPoshtaDetails.fields.senderPlace")}
            value={senderTypeLabel}
            fallback={emptyValue}
          />
          {details.sender_type === "warehouse" ? (
            <DetailColumn
              label={t("integrations.novaPoshtaWizard.fields.warehouse.label")}
              value={details.sender_warehouse_name}
              fallback={emptyValue}
            />
          ) : (
            <>
              <DetailColumn
                label={t("integrations.novaPoshtaWizard.fields.street.label")}
                value={details.sender_street_name}
                fallback={emptyValue}
              />
              <DetailColumn
                label={t("integrations.novaPoshtaWizard.fields.building.label")}
                value={details.sender_building}
                fallback={emptyValue}
              />
              <DetailColumn
                label={t("integrations.novaPoshtaWizard.fields.flat.label")}
                value={details.sender_flat}
                fallback={emptyValue}
              />
            </>
          )}
        </Row>
      </Flex>

      <Divider />

      <Flex vertical gap={12}>
        <Text strong>
          {t("integrations.novaPoshtaDetails.sections.defaults")}
        </Text>
        <Row gutter={[24, 12]}>
          <DetailColumn
            label={t("integrations.novaPoshtaDetails.fields.apiKey")}
            value={
              details.apiKeyConfigured
                ? t("integrations.novaPoshtaDetails.apiKeyConfigured")
                : t("integrations.novaPoshtaDetails.apiKeyMissing")
            }
            fallback={emptyValue}
          />
          <DetailColumn
            label={t("integrations.novaPoshtaWizard.fields.payerType.label")}
            value={payerTypeLabel}
            fallback={emptyValue}
          />
        </Row>
      </Flex>
    </Flex>
  );
}
