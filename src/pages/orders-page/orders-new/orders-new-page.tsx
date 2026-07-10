import { Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import { useIsMobileViewport } from "@/utils/use-media-query";

import { OrdersNewClientSection } from "./components/orders-new-client-section";
import { OrdersNewCommentSection } from "./components/orders-new-comment-section";
import { OrdersNewDeliverySection } from "./components/orders-new-delivery-section";
import { OrdersNewHeader } from "./components/orders-new-header";
import { OrdersNewPaymentSection } from "./components/orders-new-payment-section";
import { OrdersNewProductsSection } from "./components/orders-new-products-section";
import { OrdersNewShipmentSection } from "./components/orders-new-shipment-section";
import { OrdersNewSummaryAside } from "./components/orders-new-summary-aside";
import * as S from "./orders-new-page.styled";
import { useOrdersNewPage } from "./use-orders-new-page";

const { Title } = Typography;

export const OrdersNewPage = observer(() => {
  const { t } = useTranslation();
  const isMobileViewport = useIsMobileViewport();
  const controller = useOrdersNewPage();

  const formSections = (
    <>
      <OrdersNewClientSection
        clientForm={controller.clientForm}
        clientMode={controller.clientMode}
        clientModeOptions={controller.clientModeOptions}
        clientSearchValue={controller.clientSearchValue}
        clientsListError={controller.clientsListError}
        clientsListLoading={controller.clientsListLoading}
        clientsRequested={controller.clientsRequested}
        phoneRules={controller.phoneRules}
        selectedClient={controller.selectedClient}
        visibleClients={controller.visibleClients}
        onClientClear={controller.handleClientClear}
        onClientModeChange={controller.handleClientModeChange}
        onClientSearchChange={controller.setClientSearchValue}
        onClientSelect={controller.handleClientSelect}
        onExistingClientSearchFocus={controller.handleExistingClientSearchFocus}
      />

      <OrdersNewProductsSection
        catalogSearch={controller.catalogSearch}
        orderLines={controller.orderLines}
        productSearchOpen={controller.productSearchOpen}
        selectedVariantIds={controller.selectedVariantIds}
        onDiscountChange={controller.handleDiscountChange}
        onProductSearchOpenChange={controller.handleProductSearchOpenChange}
        onQuantityChange={controller.handleQuantityChange}
        onRemoveLine={controller.handleRemoveLine}
        onToggleDiscount={controller.handleToggleDiscount}
        onVariantSelect={controller.handleVariantSelect}
      />

      <OrdersNewDeliverySection
        deliveryForm={controller.deliveryForm}
        deliveryPhoneRules={controller.deliveryPhoneRules}
        deliveryTypeOptions={controller.deliveryTypeOptions}
        isAddressDelivery={controller.isAddressDelivery}
        novaPoshtaDelivery={controller.novaPoshtaDelivery}
        withoutDelivery={controller.withoutDelivery}
        onWithoutDeliveryChange={controller.handleWithoutDeliveryChange}
      />

      <OrdersNewPaymentSection
        deliveryForm={controller.deliveryForm}
        paymentMethodOptions={controller.paymentMethodOptions}
        paymentMethodValue={controller.paymentMethodValue}
        withoutDelivery={controller.withoutDelivery}
        onPaymentMethodChange={controller.handlePaymentMethodChange}
      />

      <OrdersNewShipmentSection
        declaredValue={controller.shipmentDeclaredValue}
        open={controller.shipmentParamsOpen}
        onDeclaredValueChange={controller.handleShipmentDeclaredValueChange}
        onToggle={controller.toggleShipmentParams}
      />

      <OrdersNewCommentSection deliveryForm={controller.deliveryForm} />
    </>
  );

  const summaryAside = (
    <OrdersNewSummaryAside
      mobile={isMobileViewport}
      canCreateOrder={controller.canCreateOrder}
      createLoading={controller.createLoading}
      orderDiscountPercent={controller.orderDiscountPercent}
      orderLinesCount={controller.orderLines.length}
      orderPositionDiscountTotal={controller.orderPositionDiscountTotal}
      orderProductsSubtotal={controller.orderProductsSubtotal}
      orderSource={controller.orderSource}
      orderSourceOptions={controller.orderSourceOptions}
      orderSummaryDeliveryAmount={controller.orderSummaryDeliveryAmount}
      orderSummaryTotal={controller.orderSummaryTotal}
      onCreateOrder={() => {
        void controller.handleCreateOrder();
      }}
      onOrderDiscountChange={controller.handleOrderDiscountChange}
      onOrderSourceChange={controller.setOrderSource}
    />
  );

  if (isMobileViewport) {
    return (
      <S.MobileRoot>
        <OrdersNewHeader mobile />

        <S.MobileScrollRegion data-qa="layout-orders-new-scroll">
          <S.MobileContent>
            {formSections}
            {summaryAside}
          </S.MobileContent>
        </S.MobileScrollRegion>
      </S.MobileRoot>
    );
  }

  return (
    <PaneDetailLayout.Root inset>
      <OrdersNewHeader />

      <PaneDetailLayout.Body data-qa="layout-orders-new-scroll">
        <S.Content>
          <S.MainColumn>
            <Title level={2} style={{ margin: "0 0 18px" }}>
              {t("orders.create.title")}
            </Title>

            {formSections}
          </S.MainColumn>

          {summaryAside}
        </S.Content>
      </PaneDetailLayout.Body>
    </PaneDetailLayout.Root>
  );
});
