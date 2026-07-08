import { CreditCardIcon } from "@phosphor-icons/react";
import {
  Alert,
  Col,
  Flex,
  Form,
  Input,
  InputNumber,
  Row,
  Segmented,
  Select,
} from "antd";
import type { FormInstance } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { ClientPhoneFormInput } from "@/components/client-phone-form-input";
import type { OrderFormValues } from "@/features/orders/model/order.types";
import { NovaPoshtaRemoteSelect } from "@/pages/settings-page/settings-integrations/nova-poshta/components/nova-poshta-remote-select";
import {
  CITY_MIN_SEARCH_LENGTH,
  STREET_MIN_SEARCH_LENGTH,
  WAREHOUSE_MIN_SEARCH_LENGTH,
} from "@/pages/settings-page/settings-integrations/nova-poshta/constants";
import type {
  CityOption,
  StreetOption,
  WarehouseOption,
} from "@/pages/settings-page/settings-integrations/nova-poshta/types";
import { phoneFieldRules } from "@/utils/phone-input";

import type { ClientOrderNovaPoshtaDeliveryState } from "./use-client-order-nova-poshta-delivery";

type ClientOrderDeliveryFormProps = {
  form: FormInstance<OrderFormValues>;
  novaPoshtaDelivery: ClientOrderNovaPoshtaDeliveryState;
};

const drawerKey = (suffix: string) =>
  `conversation.clientOrders.drawer.${suffix}` as const;

export function ClientOrderDeliveryForm({
  form,
  novaPoshtaDelivery,
}: ClientOrderDeliveryFormProps) {
  const { t } = useTranslation();
  const withoutDelivery = Form.useWatch("withoutDelivery", form) === true;
  const deliveryType = Form.useWatch("deliveryType", form) ?? "warehouse";
  const isCashOnDelivery = Form.useWatch("isCashOnDelivery", form);
  const isAddressDelivery = deliveryType === "address";

  const phoneRules = useMemo(
    () =>
      phoneFieldRules({
        required: false,
        invalidMessage: t("clients.phoneInvalid"),
      }),
    [t],
  );
  const paymentMethodOptions = useMemo(
    () => [
      {
        value: "cash_on_delivery",
        label: t(drawerKey("cashOnDelivery")),
      },
      {
        value: "prepayment",
        label: (
          <span className="client-order-payment-option">
            <CreditCardIcon size={14} />
            {t(drawerKey("prepayment"))}
          </span>
        ),
      },
    ],
    [t],
  );
  const deliveryTypeOptions = useMemo(
    () => [
      {
        value: "warehouse",
        label: t(drawerKey("deliveryTypeWarehouse")),
      },
      {
        value: "address",
        label: t(drawerKey("deliveryTypeAddress")),
      },
    ],
    [t],
  );

  return (
    <Form form={form} layout="vertical">
      <Form.Item hidden name="withoutDelivery">
        <Input />
      </Form.Item>
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

      <Flex vertical gap={12}>
        {withoutDelivery ? (
          <Alert
            showIcon
            className="client-order-no-delivery-alert"
            type="info"
            message={t(drawerKey("withoutDeliveryAlertTitle"))}
            description={t(drawerKey("withoutDeliveryAlertDescription"))}
          />
        ) : null}

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item label={t("clients.firstName")} name="firstName">
              <Input placeholder={t("clients.firstNamePlaceholder")} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t("clients.lastName")} name="lastName">
              <Input placeholder={t("clients.lastNamePlaceholder")} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label={t("clients.phone")} name="phone" rules={phoneRules}>
          <ClientPhoneFormInput
            autoComplete="tel"
            placeholder={t("clients.phonePlaceholder")}
          />
        </Form.Item>

        {!withoutDelivery ? (
          <>
            <Form.Item
              label={t(drawerKey("deliveryProviderLabel"))}
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

            <Form.Item
              label={t(drawerKey("deliveryPlaceLabel"))}
              name="deliveryType"
            >
              <Segmented
                block
                options={deliveryTypeOptions}
                onChange={novaPoshtaDelivery.onDeliveryTypeChange}
              />
            </Form.Item>

            <Form.Item
              label={t(drawerKey("deliveryCityLabel"))}
              name="cityRef"
              rules={[
                {
                  required: true,
                  message: t(drawerKey("deliveryCityRequired")),
                },
              ]}
            >
              <NovaPoshtaRemoteSelect<CityOption>
                disabled={!novaPoshtaDelivery.hasProvider}
                failed={novaPoshtaDelivery.citySelect.failed}
                loading={novaPoshtaDelivery.citySelect.loading}
                minSearchLength={CITY_MIN_SEARCH_LENGTH}
                options={novaPoshtaDelivery.cityOptions}
                placeholder={t(drawerKey("deliveryCityPlaceholder"))}
                search={novaPoshtaDelivery.citySelect.search}
                onChange={novaPoshtaDelivery.onCityChange}
                onSearch={novaPoshtaDelivery.citySelect.setSearch}
              />
            </Form.Item>

            {isAddressDelivery ? (
              <>
                <Form.Item
                  label={t(drawerKey("deliveryStreetLabel"))}
                  name="streetRef"
                  rules={[
                    {
                      required: true,
                      message: t(drawerKey("deliveryStreetRequired")),
                    },
                  ]}
                >
                  <NovaPoshtaRemoteSelect<StreetOption>
                    disabled={
                      !novaPoshtaDelivery.hasProvider ||
                      !novaPoshtaDelivery.selectedSettlementRef
                    }
                    failed={novaPoshtaDelivery.streetSelect.failed}
                    loading={novaPoshtaDelivery.streetSelect.loading}
                    minSearchLength={STREET_MIN_SEARCH_LENGTH}
                    options={novaPoshtaDelivery.streetOptions}
                    placeholder={t(drawerKey("deliveryStreetPlaceholder"))}
                    search={novaPoshtaDelivery.streetSelect.search}
                    onChange={novaPoshtaDelivery.onStreetChange}
                    onSearch={novaPoshtaDelivery.streetSelect.setSearch}
                  />
                </Form.Item>

                <Row gutter={12}>
                  <Col span={12}>
                    <Form.Item
                      label={t(drawerKey("deliveryBuildingLabel"))}
                      name="building"
                      rules={[
                        {
                          required: true,
                          whitespace: true,
                          message: t(drawerKey("deliveryBuildingRequired")),
                        },
                      ]}
                    >
                      <Input
                        placeholder={t(
                          drawerKey("deliveryBuildingPlaceholder"),
                        )}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label={t(drawerKey("deliveryFlatLabel"))}
                      name="flat"
                    >
                      <Input
                        placeholder={t(drawerKey("deliveryFlatPlaceholder"))}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </>
            ) : (
              <Form.Item
                label={t(drawerKey("deliveryWarehouseLabel"))}
                name="warehouseRef"
                rules={[
                  {
                    required: true,
                    message: t(drawerKey("deliveryWarehouseRequired")),
                  },
                ]}
              >
                <NovaPoshtaRemoteSelect<WarehouseOption>
                  disabled={
                    !novaPoshtaDelivery.hasProvider ||
                    !novaPoshtaDelivery.selectedSettlementRef
                  }
                  failed={novaPoshtaDelivery.warehouseSelect.failed}
                  loading={novaPoshtaDelivery.warehouseSelect.loading}
                  minSearchLength={WAREHOUSE_MIN_SEARCH_LENGTH}
                  options={novaPoshtaDelivery.warehouseOptions}
                  placeholder={t(drawerKey("deliveryWarehousePlaceholder"))}
                  search={novaPoshtaDelivery.warehouseSelect.search}
                  onChange={novaPoshtaDelivery.onWarehouseChange}
                  onSearch={novaPoshtaDelivery.warehouseSelect.setSearch}
                />
              </Form.Item>
            )}

            <Form.Item
              label={t(drawerKey("paymentMethodLabel"))}
              name="isCashOnDelivery"
              getValueProps={(value?: boolean) => ({
                value: value === false ? "prepayment" : "cash_on_delivery",
              })}
              normalize={(value) => value === "cash_on_delivery"}
            >
              <Segmented block options={paymentMethodOptions} />
            </Form.Item>

            {isCashOnDelivery !== false ? (
              <Form.Item
                label={t(drawerKey("cashOnDeliveryAmountLabel"))}
                name="cashOnDeliveryAmount"
                preserve={false}
              >
                <InputNumber
                  min={0}
                  controls={false}
                  addonAfter={t(drawerKey("uah"))}
                  placeholder="0"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            ) : null}
          </>
        ) : null}

        <Form.Item
          label={
            <>
              {t(drawerKey("commentLabel"))}
              <span className="client-order-optional-label">
                {t(drawerKey("optional"))}
              </span>
            </>
          }
          name="comment"
        >
          <Input.TextArea
            autoSize={{ minRows: 3, maxRows: 5 }}
            placeholder={t(drawerKey("commentPlaceholder"))}
          />
        </Form.Item>
      </Flex>
    </Form>
  );
}
