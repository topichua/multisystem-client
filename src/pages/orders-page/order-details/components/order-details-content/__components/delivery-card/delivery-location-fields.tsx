import { Col, Form, Input, Row, Segmented } from "antd";
import { useMemo } from "react";

import type { OrderDeliveryType } from "@/features/orders/model/order.types";
import type { ClientOrderNovaPoshtaDeliveryState } from "@/pages/conversation/conversation-details/components/client-order-drawer/use-client-order-nova-poshta-delivery";
import { NovaPoshtaRemoteSelect } from "@/pages/settings-page/settings-integrations/nova-poshta/components/nova-poshta-remote-select";
import {
  CITY_MIN_SEARCH_LENGTH,
  STREET_MIN_SEARCH_LENGTH,
  WAREHOUSE_MIN_SEARCH_LENGTH,
} from "@/pages/settings-page/settings-integrations/nova-poshta/constants";
import { mergeCurrentOption } from "@/pages/settings-page/settings-integrations/nova-poshta/nova-poshta-integration-card/nova-poshta-integration-card.helpers";
import type {
  CityOption,
  StreetOption,
  WarehouseOption,
} from "@/pages/settings-page/settings-integrations/nova-poshta/types";

import type {
  DeliveryInfo,
  TranslationFn,
} from "../../order-details-content.types";
import {
  buildCityOptionFromDelivery,
  buildStreetOptionFromDelivery,
  buildWarehouseOptionFromDelivery,
  drawerKey,
} from "./delivery-card.utils";

type DeliveryLocationFieldsProps = {
  deliveryType: OrderDeliveryType;
  deliveryTypeOptions: Array<{ label: string; value: OrderDeliveryType }>;
  novaPoshtaDelivery: ClientOrderNovaPoshtaDeliveryState;
  primaryDeliveryInfo: DeliveryInfo;
  t: TranslationFn;
};

export function DeliveryLocationFields({
  deliveryType,
  deliveryTypeOptions,
  novaPoshtaDelivery,
  primaryDeliveryInfo,
  t,
}: DeliveryLocationFieldsProps) {
  const cityOptions = useMemo(
    () =>
      mergeCurrentOption(
        buildCityOptionFromDelivery(primaryDeliveryInfo),
        novaPoshtaDelivery.cityOptions,
      ),
    [novaPoshtaDelivery.cityOptions, primaryDeliveryInfo],
  );

  const warehouseOptions = useMemo(
    () =>
      mergeCurrentOption(
        buildWarehouseOptionFromDelivery(primaryDeliveryInfo),
        novaPoshtaDelivery.warehouseOptions,
      ),
    [novaPoshtaDelivery.warehouseOptions, primaryDeliveryInfo],
  );

  const streetOptions = useMemo(
    () =>
      mergeCurrentOption(
        buildStreetOptionFromDelivery(primaryDeliveryInfo),
        novaPoshtaDelivery.streetOptions,
      ),
    [novaPoshtaDelivery.streetOptions, primaryDeliveryInfo],
  );

  return (
    <>
      <Form.Item label={t(drawerKey("deliveryPlaceLabel"))} name="deliveryType">
        <Segmented<OrderDeliveryType>
          block
          options={deliveryTypeOptions}
          onChange={novaPoshtaDelivery.onDeliveryTypeChange}
        />
      </Form.Item>

      <Row gutter={16}>
        <Col xs={24} md={12}>
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
              options={cityOptions}
              placeholder={t(drawerKey("deliveryCityPlaceholder"))}
              search={novaPoshtaDelivery.citySelect.search}
              onChange={novaPoshtaDelivery.onCityChange}
              onSearch={novaPoshtaDelivery.citySelect.setSearch}
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          {deliveryType === "address" ? (
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
                options={streetOptions}
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
                options={warehouseOptions}
                placeholder={t(drawerKey("deliveryWarehousePlaceholder"))}
                search={novaPoshtaDelivery.warehouseSelect.search}
                onChange={novaPoshtaDelivery.onWarehouseChange}
                onSearch={novaPoshtaDelivery.warehouseSelect.setSearch}
              />
            </Form.Item>
          )}
        </Col>
      </Row>

      {deliveryType === "address" && (
        <Row gutter={16}>
          <Col xs={24} md={12}>
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
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label={t(drawerKey("deliveryFlatLabel"))} name="flat">
              <Input placeholder={t(drawerKey("deliveryFlatPlaceholder"))} />
            </Form.Item>
          </Col>
        </Row>
      )}
    </>
  );
}
