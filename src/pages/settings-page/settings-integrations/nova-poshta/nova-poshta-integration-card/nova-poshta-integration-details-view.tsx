import { Col, Divider, Flex, Row, Typography } from "antd";
import { CreditCardIcon, MapPinIcon, PackageIcon } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

import type { NovaPoshtaPayerType } from "@/features/integrations/model/integration.types";

import * as S from "../../settings-integrations.styled";
import {
  compactValue,
  formatOptionalNumber,
} from "./nova-poshta-integration-card.helpers";
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

function formatPayerTypeLabel(
  payerType: NovaPoshtaPayerType | null | undefined,
  t: (key: string) => string,
): string {
  if (payerType === "recipient") {
    return t("integrations.novaPoshtaWizard.payerTypes.recipient");
  }

  if (payerType === "sender") {
    return t("integrations.novaPoshtaWizard.payerTypes.sender");
  }

  return "";
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
  const senderLabel = compactValue([details.sender_name, details.sender_phone]);

  return (
    <Flex vertical gap={16}>
      <Flex vertical gap={12}>
        <S.NovaPoshtaSectionTitle>
          <MapPinIcon size={16} />
          <span>{t("integrations.novaPoshtaDetails.sections.sender")}</span>
        </S.NovaPoshtaSectionTitle>
        <Row gutter={[24, 12]}>
          <Col xs={24}>
            <DetailField
              label={t("integrations.novaPoshtaWizard.fields.sender.label")}
              value={senderLabel}
              fallback={emptyValue}
            />
          </Col>
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
            <Col xs={24}>
              <DetailField
                label={t(
                  "integrations.novaPoshtaWizard.fields.warehouse.label",
                )}
                value={details.sender_warehouse_name}
                fallback={emptyValue}
              />
            </Col>
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
        <S.NovaPoshtaSectionTitle>
          <CreditCardIcon size={16} />
          <span>
            {t("integrations.novaPoshtaWizard.sections.deliveryDefaults")}
          </span>
        </S.NovaPoshtaSectionTitle>
        <Row gutter={[24, 12]}>
          <DetailColumn
            label={t("integrations.novaPoshtaWizard.fields.payerType.label")}
            value={formatPayerTypeLabel(details.payer_type, t)}
            fallback={emptyValue}
          />
          <DetailColumn
            label={t(
              "integrations.novaPoshtaWizard.fields.codCommissionPayer.label",
            )}
            value={formatPayerTypeLabel(details.cod_commission_payer, t)}
            fallback={emptyValue}
          />
          <Col xs={24}>
            <DetailField
              label={t(
                "integrations.novaPoshtaWizard.fields.paymentPurpose.label",
              )}
              value={details.payment_purpose}
              fallback={emptyValue}
            />
          </Col>
        </Row>
      </Flex>

      <Divider />

      <Flex vertical gap={12}>
        <S.NovaPoshtaSectionTitle>
          <PackageIcon size={16} />
          <span>
            {t("integrations.novaPoshtaWizard.sections.reservePackaging")}
          </span>
        </S.NovaPoshtaSectionTitle>
        <Row gutter={[24, 12]}>
          <DetailColumn
            label={t(
              "integrations.novaPoshtaWizard.fields.defaultWeightKg.label",
            )}
            value={formatOptionalNumber(details.default_weight_kg)}
            fallback={emptyValue}
          />
          <DetailColumn
            label={t(
              "integrations.novaPoshtaWizard.fields.defaultLengthCm.label",
            )}
            value={formatOptionalNumber(details.default_length_cm)}
            fallback={emptyValue}
          />
          <DetailColumn
            label={t(
              "integrations.novaPoshtaWizard.fields.defaultWidthCm.label",
            )}
            value={formatOptionalNumber(details.default_width_cm)}
            fallback={emptyValue}
          />
          <DetailColumn
            label={t(
              "integrations.novaPoshtaWizard.fields.defaultHeightCm.label",
            )}
            value={formatOptionalNumber(details.default_height_cm)}
            fallback={emptyValue}
          />
        </Row>
      </Flex>
    </Flex>
  );
}
