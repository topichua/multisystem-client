import { FloppyDiskIcon, XIcon } from "@phosphor-icons/react";
import { Button, Col, Flex, Form, Input, Row } from "antd";
import type { FormInstance } from "antd";
import { useTranslation } from "react-i18next";

import type { MonobankIntegrationPayload } from "@/features/integrations/model/integration.types";

export type MonobankIntegrationFormValues = MonobankIntegrationPayload;

type MonobankIntegrationFormProps = {
  form?: FormInstance<MonobankIntegrationFormValues>;
  initialValues?: Partial<MonobankIntegrationFormValues>;
  mode: "connect" | "edit";
  submitting: boolean;
  onCancel: () => void;
  onSubmit: (payload: MonobankIntegrationPayload) => void;
};

export function MonobankIntegrationForm({
  form,
  initialValues,
  mode,
  submitting,
  onCancel,
  onSubmit,
}: MonobankIntegrationFormProps) {
  const { t } = useTranslation();
  const [internalForm] = Form.useForm<MonobankIntegrationFormValues>();
  const resolvedForm = form ?? internalForm;

  return (
    <Form
      form={resolvedForm}
      layout="vertical"
      requiredMark={false}
      initialValues={{
        displayName: t("integrations.monobank.defaultDisplayName"),
        ...initialValues,
      }}
      onFinish={(values) =>
        onSubmit({
          displayName: values.displayName.trim(),
          merchantToken: values.merchantToken.trim(),
        })
      }
    >
      <Row gutter={12}>
        <Col xs={24} md={12}>
          <Form.Item
            label={t("integrations.monobank.fields.displayName.label")}
            name="displayName"
            rules={[
              {
                required: true,
                whitespace: true,
                message: t("integrations.monobank.fields.displayName.required"),
              },
            ]}
          >
            <Input
              placeholder={t(
                "integrations.monobank.fields.displayName.placeholder",
              )}
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            label={t("integrations.monobank.fields.merchantToken.label")}
            name="merchantToken"
            rules={[
              {
                required: true,
                whitespace: true,
                message: t(
                  "integrations.monobank.fields.merchantToken.required",
                ),
              },
            ]}
          >
            <Input.Password
              autoComplete="new-password"
              placeholder={t(
                "integrations.monobank.fields.merchantToken.placeholder",
              )}
            />
          </Form.Item>
        </Col>
      </Row>

      <Flex justify="flex-end" gap={8} wrap>
        <Button icon={<XIcon />} onClick={onCancel}>
          {t("integrations.monobank.actions.cancel")}
        </Button>
        <Button
          htmlType="submit"
          type="primary"
          icon={<FloppyDiskIcon />}
          loading={submitting}
        >
          {t(`integrations.monobank.actions.${mode}`)}
        </Button>
      </Flex>
    </Form>
  );
}
