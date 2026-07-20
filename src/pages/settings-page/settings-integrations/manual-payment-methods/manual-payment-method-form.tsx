import { CheckIcon, XIcon } from "@phosphor-icons/react";
import { Button, Form, Input, Segmented } from "antd";
import type { FormInstance } from "antd";
import type { ChangeEvent } from "react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import type { ManualPaymentMethodPayload } from "@/features/integrations/model/integration.types";

import * as S from "../settings-integrations.styled";

const MANUAL_PAYMENT_TYPES = ["iban", "card"] as const;
const IBAN_PREFIX = "UA";
const IBAN_DIGITS_LENGTH = 27;
const IBAN_LENGTH = IBAN_PREFIX.length + IBAN_DIGITS_LENGTH;
const UA_IBAN_PATTERN = /^UA\d{27}$/;
const CARD_DIGITS_LENGTH = 16;
const CARD_GROUP_SIZE = 4;
const CARD_FORMATTED_LENGTH =
  CARD_DIGITS_LENGTH + CARD_DIGITS_LENGTH / CARD_GROUP_SIZE - 1;
const CARD_PATTERN = /^\d{16}$/;

type ManualPaymentMethodFormType = (typeof MANUAL_PAYMENT_TYPES)[number];

export type ManualPaymentMethodFormValues = {
  name: string;
  type: ManualPaymentMethodFormType;
  value: string;
};

type ManualPaymentMethodFormProps = {
  form?: FormInstance<ManualPaymentMethodFormValues>;
  initialValues?: Partial<ManualPaymentMethodFormValues>;
  mode: "create" | "edit";
  submitting: boolean;
  onCancel?: () => void;
  onSubmit: (payload: ManualPaymentMethodPayload) => void;
};

const normalizeIbanInput = (value: string): string => {
  const upperValue = value.toUpperCase();
  const valueWithoutPrefix = upperValue.startsWith(IBAN_PREFIX)
    ? upperValue.slice(IBAN_PREFIX.length)
    : upperValue;
  const digits = valueWithoutPrefix
    .replace(/\D/g, "")
    .slice(0, IBAN_DIGITS_LENGTH);

  return `${IBAN_PREFIX}${digits}`;
};

const normalizeCardInput = (value: string): string =>
  value.replace(/\D/g, "").slice(0, CARD_DIGITS_LENGTH);

const formatCardInput = (value: string): string =>
  normalizeCardInput(value)
    .replace(new RegExp(`(.{${CARD_GROUP_SIZE}})`, "g"), "$1 ")
    .trim();

export function ManualPaymentMethodForm({
  form,
  initialValues,
  mode,
  submitting,
  onCancel,
  onSubmit,
}: ManualPaymentMethodFormProps) {
  const { t } = useTranslation();
  const [internalForm] = Form.useForm<ManualPaymentMethodFormValues>();
  const resolvedForm = form ?? internalForm;
  const selectedType =
    Form.useWatch("type", resolvedForm) ?? initialValues?.type ?? "iban";
  const formInitialType = initialValues?.type ?? "iban";
  const valueFieldKey =
    selectedType === "card"
      ? "integrations.manualPayment.fields.cardNumber"
      : "integrations.manualPayment.fields.iban";
  const normalizedInitialValue =
    formInitialType === "iban"
      ? normalizeIbanInput(initialValues?.value ?? "")
      : formInitialType === "card"
        ? formatCardInput(initialValues?.value ?? "")
        : initialValues?.value;

  useEffect(() => {
    const currentValue = String(resolvedForm.getFieldValue("value") ?? "");

    if (selectedType === "iban") {
      if (currentValue && !currentValue.toUpperCase().startsWith(IBAN_PREFIX)) {
        resolvedForm.setFieldValue("value", IBAN_PREFIX);
        return;
      }

      const normalizedValue = normalizeIbanInput(currentValue);

      if (currentValue !== normalizedValue) {
        resolvedForm.setFieldValue("value", normalizedValue);
      }

      return;
    }

    if (currentValue.toUpperCase().startsWith(IBAN_PREFIX)) {
      resolvedForm.setFieldValue("value", "");
      return;
    }

    const formattedValue = formatCardInput(currentValue);

    if (currentValue !== formattedValue) {
      resolvedForm.setFieldValue("value", formattedValue);
    }
  }, [resolvedForm, selectedType]);

  return (
    <S.ManualPaymentMethodFormPanel>
      <Form
        form={resolvedForm}
        layout="vertical"
        requiredMark={false}
        initialValues={{
          type: "iban",
          ...initialValues,
          value: normalizedInitialValue,
        }}
        onFinish={(values) => {
          const value =
            values.type === "iban"
              ? normalizeIbanInput(values.value)
              : values.type === "card"
                ? normalizeCardInput(values.value)
                : values.value.trim();

          onSubmit({
            name: values.name.trim(),
            type: values.type,
            value,
          });
        }}
      >
        <Form.Item
          label={t("integrations.manualPayment.fields.name.label")}
          name="name"
          rules={[
            {
              required: true,
              whitespace: true,
              message: t("integrations.manualPayment.fields.name.required"),
            },
          ]}
        >
          <Input
            placeholder={t(
              "integrations.manualPayment.fields.name.placeholder",
            )}
          />
        </Form.Item>

        <Form.Item name="type" style={{ marginBottom: 0 }}>
          <Segmented
            block
            options={MANUAL_PAYMENT_TYPES.map((type) => ({
              label: t(`integrations.manualPayment.types.${type}`),
              value: type,
            }))}
          />
        </Form.Item>

        <Form.Item
          label={t(`${valueFieldKey}.label`)}
          name="value"
          getValueFromEvent={(event: ChangeEvent<HTMLInputElement>) =>
            selectedType === "iban"
              ? normalizeIbanInput(event.target.value)
              : selectedType === "card"
                ? formatCardInput(event.target.value)
                : event.target.value
          }
          rules={[
            {
              required: true,
              whitespace: true,
              message: t(`${valueFieldKey}.required`),
            },
            {
              validator: (_, value: string | undefined) => {
                if (selectedType !== "iban") {
                  return Promise.resolve();
                }

                return UA_IBAN_PATTERN.test(normalizeIbanInput(value ?? ""))
                  ? Promise.resolve()
                  : Promise.reject(new Error(t(`${valueFieldKey}.invalid`)));
              },
            },
            {
              validator: (_, value: string | undefined) => {
                if (selectedType !== "card") {
                  return Promise.resolve();
                }

                return CARD_PATTERN.test(normalizeCardInput(value ?? ""))
                  ? Promise.resolve()
                  : Promise.reject(new Error(t(`${valueFieldKey}.invalid`)));
              },
            },
          ]}
        >
          <Input
            inputMode={
              selectedType === "iban" || selectedType === "card"
                ? "numeric"
                : undefined
            }
            maxLength={
              selectedType === "iban"
                ? IBAN_LENGTH
                : selectedType === "card"
                  ? CARD_FORMATTED_LENGTH
                  : undefined
            }
            placeholder={t(`${valueFieldKey}.placeholder`)}
          />
        </Form.Item>

        <S.ManualPaymentMethodFormActions
          $single={mode === "create" && !onCancel}
        >
          {onCancel && (
            <Button icon={<XIcon />} onClick={onCancel}>
              {t("integrations.manualPayment.actions.cancel")}
            </Button>
          )}
          <Button
            block={mode === "create"}
            htmlType="submit"
            type="primary"
            icon={<CheckIcon />}
            loading={submitting}
          >
            {t("integrations.manualPayment.actions.save")}
          </Button>
        </S.ManualPaymentMethodFormActions>
      </Form>
    </S.ManualPaymentMethodFormPanel>
  );
}
