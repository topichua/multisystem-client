import type { Client } from "@/features/clients/model/client.types";
import { observer } from "mobx-react-lite";
import { Badge, Card, Drawer, Flex, Space, Typography } from "antd";
import { useTranslation } from "react-i18next";

import { ClientOrderClientCard } from "./client-order-client-card";
import { ClientOrderDeliveryForm } from "./client-order-delivery-form";
import { ClientOrderDrawerFooter } from "./client-order-drawer-footer";
import { ClientOrderProductsSection } from "./client-order-products-section";
import { useClientOrderCreateController } from "./use-client-order-create-controller";

const { Text } = Typography;

type ClientOrderDrawerProps = {
  onClose: () => void;
  onOpen: boolean;
  linkedClient: Client;
  conversationId: number;
  clientPic?: string;
  onOrderCreated?: () => void;
};

const sectionTitle = (step: number, title: string) => (
  <Space>
    <Badge color="purple" count={step} />
    <Text strong>{title}</Text>
  </Space>
);

export const ClientOrderDrawer = observer(
  ({
    onClose,
    onOpen,
    linkedClient,
    conversationId,
    clientPic,
    onOrderCreated,
  }: ClientOrderDrawerProps) => {
    const { t } = useTranslation();
    const {
      billingMethodOptions,
      catalogSearchLoading,
      createLoading,
      deliveryMethodOptions,
      form,
      handleCatalogSearch,
      handleDrawerClose,
      handlePlaceOrder,
      handleVariantSelect,
      minSearchLength,
      orderLines,
      orderTotals,
      productPickerKey,
      removeLine,
      trimmedSearch,
      updateLineQuantity,
      variantSelectOptions,
    } = useClientOrderCreateController({
      conversationId,
      linkedClient,
      onClose,
      onOrderCreated,
    });

    return (
      <>
        <Drawer
          title={t("conversation.clientOrders.drawerTitle")}
          closable={{
            "aria-label": t("conversation.clientOrders.closeDrawerAria"),
          }}
          onClose={handleDrawerClose}
          open={onOpen}
          size={960}
          destroyOnHidden
          footer={
            <ClientOrderDrawerFooter
              createLoading={createLoading}
              orderTotals={orderTotals}
              placeOrderDisabled={orderLines.length === 0}
              onCancel={handleDrawerClose}
              onPlaceOrder={() => void handlePlaceOrder()}
            />
          }
        >
          <Flex vertical gap={16}>
            <ClientOrderClientCard
              clientPic={clientPic}
              linkedClient={linkedClient}
              title={sectionTitle(
                1,
                t("conversation.clientOrders.drawer.sectionClient"),
              )}
            />

            <ClientOrderProductsSection
              catalogSearchLoading={catalogSearchLoading}
              minSearchLength={minSearchLength}
              orderLines={orderLines}
              productPickerKey={productPickerKey}
              title={sectionTitle(
                2,
                t("conversation.clientOrders.drawer.sectionProducts"),
              )}
              trimmedSearch={trimmedSearch}
              variantSelectOptions={variantSelectOptions}
              onProductSearch={handleCatalogSearch}
              onQuantityChange={updateLineQuantity}
              onRemoveLine={removeLine}
              onVariantSelect={handleVariantSelect}
            />

            <Card
              size="small"
              title={sectionTitle(
                3,
                t("conversation.clientOrders.drawer.sectionOrderDetails"),
              )}
              styles={{
                root: {
                  borderColor: "#e2e1e1",
                },
                header: {
                  borderColor: "#e2e1e1",
                },
              }}
            >
              <ClientOrderDeliveryForm
                billingMethodOptions={billingMethodOptions}
                deliveryMethodOptions={deliveryMethodOptions}
                form={form}
              />
            </Card>
          </Flex>
        </Drawer>
      </>
    );
  },
);
