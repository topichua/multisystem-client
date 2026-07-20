import { InfoIcon, TruckIcon } from "@phosphor-icons/react";
import { Alert, Button, Form, Input, Segmented, Select, Space } from "antd";
import type { FormInstance } from "antd";
import { useCallback, useEffect, useRef, useState } from "react";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import type {
  OrderDeliveryPayload,
  OrderDeliveryType,
  OrderFormValues,
} from "@/features/orders/model/order.types";
import { useClientOrderNovaPoshtaDelivery } from "@/pages/conversation/conversation-details/components/client-order-drawer/use-client-order-nova-poshta-delivery";
import { useNotification } from "@/shared/components/notification/use-notification";

import {
  DeliveryPackageFields,
  DeliveryPaymentFields,
  DeliveryRecipientFields,
  ExistingWaybillFields,
} from "./delivery-detail-fields";
import { DeliveryLocationFields } from "./delivery-location-fields";
import {
  buildDeliveryPatchPayloadFromForm,
  buildTrackingPayloadFromForm,
  buildWaybillPayloadFromForm,
  DELIVERY_PATCH_DEBOUNCE_MS,
  DELIVERY_PATCH_EXCLUDED_FIELDS,
  drawerKey,
  getDeliveryFormInitialValues,
  hasDeliveryPatchChanges,
  isFormValidationError,
} from "./delivery-card.utils";
import type {
  DeliveryAddFormValues,
  DeliveryAddMode,
  DeliveryAddPanelProps,
  PaymentMode,
} from "./delivery-card.types";

const fullWidth = { width: "100%" };

export function DeliveryAddPanel({
  primaryDeliveryInfo,
  t,
  onCreateNovaPoshtaWaybill,
  onUpdateDelivery,
  onAttachDeliveryTracking,
}: DeliveryAddPanelProps) {
  const notification = useNotification();
  const [form] = Form.useForm<DeliveryAddFormValues>();
  const novaPoshtaDelivery = useClientOrderNovaPoshtaDelivery({
    form: form as unknown as FormInstance<OrderFormValues>,
  });
  const [mode, setMode] = useState<DeliveryAddMode>("create");
  const [actionLoading, setActionLoading] = useState(false);
  const [initialDeliveryInfo] = useState(primaryDeliveryInfo);
  const [initialValues] = useState(() =>
    getDeliveryFormInitialValues({ primaryDeliveryInfo }),
  );
  const baselineRef = useRef<OrderDeliveryPayload>(
    buildDeliveryPatchPayloadFromForm(initialValues),
  );
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const patchQueueRef = useRef<Promise<void>>(Promise.resolve());
  const deliveryType =
    (Form.useWatch("deliveryType", form) as OrderDeliveryType | undefined) ??
    "warehouse";
  const paymentMode =
    (Form.useWatch("paymentMode", form) as PaymentMode | undefined) ??
    "cash_on_delivery";

  useEffect(() => {
    if (!novaPoshtaDelivery.hasProvider) {
      return;
    }

    form.setFieldValue("shipmentType", novaPoshtaDelivery.selectedShipmentType);
  }, [
    form,
    novaPoshtaDelivery.hasProvider,
    novaPoshtaDelivery.selectedShipmentType,
  ]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const modeOptions = [
    {
      label: t("orders.details.createWaybillWithNovaPoshta"),
      value: "create" as const,
    },
    {
      label: t("orders.details.attachExistingWaybill"),
      value: "existing" as const,
    },
  ];

  const deliveryTypeOptions = [
    {
      label: t(drawerKey("deliveryTypeWarehouse")),
      value: "warehouse" as const,
    },
    {
      label: t(drawerKey("deliveryTypeAddress")),
      value: "address" as const,
    },
  ];

  const paymentModeOptions = [
    {
      label: t(drawerKey("cashOnDelivery")),
      value: "cash_on_delivery" as const,
    },
    {
      label: t(drawerKey("prepayment")),
      value: "prepayment" as const,
    },
  ];

  const scheduleDeliveryPatch = useCallback(
    (values: DeliveryAddFormValues) => {
      if (mode !== "create") {
        return;
      }

      const next = buildDeliveryPatchPayloadFromForm(values);
      if (!hasDeliveryPatchChanges(next, baselineRef.current)) {
        return;
      }

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        patchQueueRef.current = patchQueueRef.current
          .catch(() => undefined)
          .then(async () => {
            const latest = buildDeliveryPatchPayloadFromForm(
              form.getFieldsValue(true),
            );
            if (!hasDeliveryPatchChanges(latest, baselineRef.current)) {
              return;
            }

            try {
              await onUpdateDelivery(latest);
              baselineRef.current = latest;
            } catch (error) {
              notification.error({
                title: getApiErrorMessage(
                  error,
                  t("orders.details.deliverySaveFailed"),
                ),
              });
            }
          });
      }, DELIVERY_PATCH_DEBOUNCE_MS);
    },
    [form, mode, notification, onUpdateDelivery, t],
  );

  const flushDeliveryPatch = useCallback(async () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    const latest = buildDeliveryPatchPayloadFromForm(form.getFieldsValue(true));
    if (hasDeliveryPatchChanges(latest, baselineRef.current)) {
      await onUpdateDelivery(latest);
      baselineRef.current = latest;
    }

    await patchQueueRef.current.catch(() => undefined);
  }, [form, onUpdateDelivery]);

  const handlePaymentModeChange = (nextMode: PaymentMode): void => {
    form.setFieldsValue({
      cashOnDeliveryAmount:
        nextMode === "cash_on_delivery"
          ? form.getFieldValue("cashOnDeliveryAmount")
          : undefined,
      paymentMode: nextMode,
    });
    scheduleDeliveryPatch(form.getFieldsValue(true));
  };

  const handleCreateWaybill = useCallback(async () => {
    let values: DeliveryAddFormValues;

    try {
      values = await form.validateFields();
    } catch (error) {
      if (!isFormValidationError(error)) {
        notification.error({
          title: getApiErrorMessage(
            error,
            t("orders.details.createWaybillFailed"),
          ),
        });
      }
      return;
    }

    setActionLoading(true);

    try {
      await flushDeliveryPatch();
      await onCreateNovaPoshtaWaybill(buildWaybillPayloadFromForm(values));
      notification.success({
        title: t("orders.details.createWaybillSuccess"),
      });
    } catch (error) {
      notification.error({
        title: getApiErrorMessage(
          error,
          t("orders.details.createWaybillFailed"),
        ),
      });
    } finally {
      setActionLoading(false);
    }
  }, [flushDeliveryPatch, form, notification, onCreateNovaPoshtaWaybill, t]);

  const handleAttachTracking = useCallback(async () => {
    let values: DeliveryAddFormValues;

    try {
      values = await form.validateFields([
        "novaPoshtaIntegrationId",
        "trackingNumber",
        "phone",
      ]);
    } catch (error) {
      if (!isFormValidationError(error)) {
        notification.error({
          title: getApiErrorMessage(
            error,
            t("orders.details.deliverySaveFailed"),
          ),
        });
      }
      return;
    }

    setActionLoading(true);

    try {
      await onAttachDeliveryTracking(buildTrackingPayloadFromForm(values));
      notification.success({
        title: t("orders.details.attachDeliverySuccess"),
      });
    } catch (error) {
      notification.error({
        title: getApiErrorMessage(
          error,
          t("orders.details.deliverySaveFailed"),
        ),
      });
    } finally {
      setActionLoading(false);
    }
  }, [form, notification, onAttachDeliveryTracking, t]);

  return (
    <Space
      className="no-print"
      orientation="vertical"
      size="middle"
      style={fullWidth}
    >
      <Segmented<DeliveryAddMode>
        block
        options={modeOptions}
        value={mode}
        onChange={setMode}
      />

      <Alert
        showIcon
        icon={<InfoIcon size={18} />}
        title={
          mode === "create"
            ? t("orders.details.createDeliveryDescription")
            : t("orders.details.attachDeliveryDescription")
        }
        type="info"
      />

      <Form
        form={form}
        initialValues={initialValues}
        layout="vertical"
        disabled={actionLoading}
        onValuesChange={(changedValues, allValues) => {
          const changedKeys = Object.keys(changedValues);
          if (
            changedKeys.length > 0 &&
            changedKeys.every((key) => DELIVERY_PATCH_EXCLUDED_FIELDS.has(key))
          ) {
            return;
          }

          scheduleDeliveryPatch(allValues);
        }}
      >
        <Form.Item hidden name="deliveryMethod">
          <Input />
        </Form.Item>
        <Form.Item hidden name="city">
          <Input />
        </Form.Item>
        <Form.Item hidden name="settlementRef">
          <Input />
        </Form.Item>
        <Form.Item hidden name="warehouse">
          <Input />
        </Form.Item>
        <Form.Item hidden name="street">
          <Input />
        </Form.Item>

        <Form.Item
          label={
            mode === "create"
              ? t(drawerKey("deliveryProviderLabel"))
              : t("orders.deliveryProvider")
          }
          name="novaPoshtaIntegrationId"
          rules={[
            {
              required: true,
              message: t(drawerKey("deliveryProviderRequired")),
            },
          ]}
        >
          <Select<number>
            disabled={
              novaPoshtaDelivery.integrationsLoading ||
              novaPoshtaDelivery.providerOptions.length === 0
            }
            loading={novaPoshtaDelivery.integrationsLoading}
            notFoundContent={
              novaPoshtaDelivery.integrationsFailed
                ? t(drawerKey("deliveryProviderLoadFailed"))
                : t(drawerKey("noNovaPoshtaIntegrations"))
            }
            options={novaPoshtaDelivery.providerOptions}
            placeholder={t(drawerKey("deliveryProviderPlaceholder"))}
            onChange={novaPoshtaDelivery.onProviderChange}
          />
        </Form.Item>

        {mode === "create" ? (
          <>
            <DeliveryLocationFields
              deliveryType={deliveryType}
              deliveryTypeOptions={deliveryTypeOptions}
              novaPoshtaDelivery={novaPoshtaDelivery}
              primaryDeliveryInfo={initialDeliveryInfo}
              t={t}
            />
            <DeliveryRecipientFields t={t} />
            <DeliveryPaymentFields
              paymentMode={paymentMode}
              paymentModeOptions={paymentModeOptions}
              t={t}
              onPaymentModeChange={handlePaymentModeChange}
            />
            <DeliveryPackageFields t={t} />
          </>
        ) : (
          <>
            <Form.Item
              label={t("orders.phone")}
              name="phone"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: t("orders.details.requiredField"),
                },
              ]}
            >
              <Input />
            </Form.Item>
            <ExistingWaybillFields t={t} />
          </>
        )}

        <Button
          block
          icon={<TruckIcon size={18} />}
          loading={actionLoading}
          type="primary"
          onClick={() => {
            void (mode === "create"
              ? handleCreateWaybill()
              : handleAttachTracking());
          }}
        >
          {mode === "create"
            ? t("orders.details.createWaybill")
            : t("orders.details.attachDelivery")}
        </Button>
      </Form>
    </Space>
  );
}
