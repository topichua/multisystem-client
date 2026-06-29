import { InfoIcon } from "@phosphor-icons/react";
import { Form, Input, Typography } from "antd";
import { useTranslation } from "react-i18next";

import * as S from "../../settings-integrations.styled";

export function ApiKeyStep() {
  const { t } = useTranslation();

  return (
    <>
      <Form.Item
        label={t("integrations.novaPoshtaWizard.fields.name.label")}
        name="name"
        rules={[
          {
            required: true,
            whitespace: true,
            message: t("integrations.novaPoshtaWizard.fields.name.required"),
          },
        ]}
      >
        <Input
          autoFocus
          placeholder={t(
            "integrations.novaPoshtaWizard.fields.name.placeholder",
          )}
        />
      </Form.Item>

      <Form.Item
        label={t("integrations.novaPoshtaWizard.fields.apiKey.label")}
        name="apiKey"
        rules={[
          {
            required: true,
            whitespace: true,
            message: t("integrations.novaPoshtaWizard.fields.apiKey.required"),
          },
        ]}
      >
        <Input.Password
          visibilityToggle
          placeholder={t(
            "integrations.novaPoshtaWizard.fields.apiKey.placeholder",
          )}
        />
      </Form.Item>

      <S.NovaPoshtaWizardHint>
        <InfoIcon size={14} />
        <Typography.Text type="secondary">
          {t("integrations.novaPoshtaWizard.apiKeyHint")}
        </Typography.Text>
      </S.NovaPoshtaWizardHint>
    </>
  );
}
