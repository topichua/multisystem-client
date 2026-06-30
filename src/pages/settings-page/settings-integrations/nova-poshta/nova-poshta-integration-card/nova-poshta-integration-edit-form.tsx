import { FloppyDiskIcon, XIcon } from "@phosphor-icons/react";
import { Alert, Button, Col, Flex, Form, Input, Row } from "antd";
import { useTranslation } from "react-i18next";

import { HiddenFields } from "../components/hidden-fields";
import { PayerTypeField } from "../components/payer-type-field";
import { SenderStep } from "../components/sender-step";
import type { NovaPoshtaIntegrationEditFormProps } from "./nova-poshta-integration-card.types";

export function NovaPoshtaIntegrationEditForm({
  form,
  isSaving,
  locationSelects,
  senderSelect,
  onCancel,
  onSubmit,
}: NovaPoshtaIntegrationEditFormProps) {
  const { t } = useTranslation();

  return (
    <Form form={form} layout="vertical" requiredMark={false} onFinish={onSubmit}>
      <HiddenFields includeSenderFields />

      <Row gutter={12}>
        <Col xs={24} md={12}>
          <Form.Item
            label={t("integrations.novaPoshtaWizard.fields.name.label")}
            name="name"
            rules={[
              {
                required: true,
                whitespace: true,
                message: t(
                  "integrations.novaPoshtaWizard.fields.name.required",
                ),
              },
            ]}
          >
            <Input
              placeholder={t(
                "integrations.novaPoshtaWizard.fields.name.placeholder",
              )}
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            label={t("integrations.novaPoshtaWizard.fields.apiKey.label")}
            name="apiKey"
          >
            <Input.Password
              autoComplete="new-password"
              placeholder={t(
                "integrations.novaPoshtaDetails.apiKeyPlaceholder",
              )}
            />
          </Form.Item>
        </Col>
      </Row>

      {senderSelect.error ? (
        <Alert showIcon type="error" title={senderSelect.error} />
      ) : null}

      <SenderStep
        columnBreakpoint="md"
        senderTypeLabel="senderPlace"
        cityOptions={locationSelects.cityOptions}
        citySelect={locationSelects.citySelect}
        selectedCityRef={locationSelects.selectedCityRef}
        selectedSenderType={locationSelects.selectedSenderType}
        selectedSettlementRef={locationSelects.selectedSettlementRef}
        senderLoading={senderSelect.loading}
        senderOptions={senderSelect.senderOptions}
        streetOptions={locationSelects.streetOptions}
        streetSelect={locationSelects.streetSelect}
        warehouseOptions={locationSelects.warehouseOptions}
        warehouseSelect={locationSelects.warehouseSelect}
        onCityChange={locationSelects.onCityChange}
        onSenderChange={senderSelect.onSenderChange}
        onSenderTypeChange={locationSelects.onSenderTypeChange}
        onStreetChange={locationSelects.onStreetChange}
        onWarehouseChange={locationSelects.onWarehouseChange}
      />

      <Row gutter={12}>
        <Col xs={24} md={12}>
          <PayerTypeField />
        </Col>
      </Row>

      <Flex justify="flex-end" gap={8} wrap>
        <Button icon={<XIcon />} onClick={onCancel}>
          {t("integrations.novaPoshtaDetails.cancelAction")}
        </Button>
        <Button
          htmlType="submit"
          type="primary"
          icon={<FloppyDiskIcon />}
          loading={isSaving}
        >
          {t("integrations.novaPoshtaDetails.saveAction")}
        </Button>
      </Flex>
    </Form>
  );
}
