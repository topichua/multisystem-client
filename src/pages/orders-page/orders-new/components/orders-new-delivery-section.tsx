import { TruckIcon } from "@phosphor-icons/react";
import {
  Alert,
  Flex,
  Form,
  Input,
  Segmented,
  Select,
  Switch,
  Typography,
} from "antd";
import type { FormInstance, Rule } from "antd/es/form";
import { useTranslation } from "react-i18next";

// import { ClientPhoneFormInput } from '@/components/client-phone-form-input';
import type {
  OrderDeliveryType,
  OrderFormValues,
} from "@/features/orders/model/order.types";
import type { useClientOrderNovaPoshtaDelivery } from "@/pages/conversation/conversation-details/components/client-order-drawer/use-client-order-nova-poshta-delivery";
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

import { drawerKey } from "../orders-new.constants";
import * as S from "../orders-new-page.styled";
import { SectionHeading } from "./section-heading";

const { Text } = Typography;

type NovaPoshtaDelivery = ReturnType<typeof useClientOrderNovaPoshtaDelivery>;

type OrdersNewDeliverySectionProps = {
  deliveryForm: FormInstance<OrderFormValues>;
  deliveryPhoneRules: Rule[];
  deliveryTypeOptions: Array<{ label: string; value: OrderDeliveryType }>;
  isAddressDelivery: boolean;
  novaPoshtaDelivery: NovaPoshtaDelivery;
  onWithoutDeliveryChange: (checked: boolean) => void;
  withoutDelivery: boolean;
};

export function OrdersNewDeliverySection({
  deliveryForm,
  // deliveryPhoneRules,
  deliveryTypeOptions,
  isAddressDelivery,
  novaPoshtaDelivery,
  onWithoutDeliveryChange,
  withoutDelivery,
}: OrdersNewDeliverySectionProps) {
  const { t } = useTranslation();

  return (
    <S.SectionCard>
      <S.CardHeader justify="space-between" align="center">
        <SectionHeading icon={<TruckIcon size={18} />}>
          {t("orders.create.delivery.title")}
        </SectionHeading>
        <Flex align="center" gap={8}>
          <Text>{t(drawerKey("withoutDelivery"))}</Text>
          <Switch
            checked={withoutDelivery}
            onChange={onWithoutDeliveryChange}
          />
        </Flex>
      </S.CardHeader>

      <S.DeliveryFormPanel>
        <Form form={deliveryForm} layout="vertical">
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
          <Form.Item hidden name="lastName">
            <Input />
          </Form.Item>

          {!withoutDelivery ? (
            <Flex vertical gap={12}>
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
                <Segmented<OrderDeliveryType>
                  block
                  options={deliveryTypeOptions}
                  onChange={novaPoshtaDelivery.onDeliveryTypeChange}
                />
              </Form.Item>

              <S.DeliveryGrid>
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
              </S.DeliveryGrid>

              {isAddressDelivery && (
                <S.DeliveryGrid>
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
                      placeholder={t(drawerKey("deliveryBuildingPlaceholder"))}
                    />
                  </Form.Item>
                  <Form.Item
                    label={t(drawerKey("deliveryFlatLabel"))}
                    name="flat"
                  >
                    <Input
                      placeholder={t(drawerKey("deliveryFlatPlaceholder"))}
                    />
                  </Form.Item>
                </S.DeliveryGrid>
              )}

              {/* <S.DeliveryGrid>
                <Form.Item
                  label={t('orders.create.delivery.recipient')}
                  name="firstName"
                >
                  <Input
                    placeholder={t(
                      'orders.create.delivery.recipientPlaceholder',
                    )}
                  />
                </Form.Item>
                <Form.Item
                  label={t('orders.create.delivery.recipientPhone')}
                  name="phone"
                  rules={deliveryPhoneRules}
                >
                  <ClientPhoneFormInput
                    autoComplete="tel"
                    placeholder={t(
                      'orders.create.delivery.recipientPhonePlaceholder',
                    )}
                  />
                </Form.Item>
              </S.DeliveryGrid> */}
            </Flex>
          ) : (
            <Alert
              showIcon
              className="client-order-no-delivery-alert"
              type="info"
              title={t(drawerKey("withoutDeliveryAlertTitle"))}
              description={t(drawerKey("withoutDeliveryAlertDescription"))}
            />
          )}
        </Form>
      </S.DeliveryFormPanel>
    </S.SectionCard>
  );
}
