import type { Client } from "@/features/clients/model/client.types";
import { observer } from "mobx-react-lite";
import { Drawer } from "antd";
import { useTranslation } from "react-i18next";

import * as S from "./client-order-drawer.styled";
import { ClientOrderClientCard } from "./client-order-client-card";
import { ClientOrderDeliveryForm } from "./client-order-delivery-form";
import { ClientOrderDrawerFooter } from "./client-order-drawer-footer";
import { ClientOrderProductsSection } from "./client-order-products-section";
import { useClientOrderCreateController } from "./use-client-order-create-controller";

type ClientOrderDrawerProps = {
  onClose: () => void;
  open: boolean;
  linkedClient: Client;
  conversationId: number;
  clientPic?: string;
  onOrderCreated?: () => void;
};

const sectionTitle = (step: number, title: string) => (
  <S.SectionTitle>
    <S.StepBadge>{step}</S.StepBadge>
    <S.SectionTitleText>{title}</S.SectionTitleText>
  </S.SectionTitle>
);

export const ClientOrderDrawer = observer(
  ({
    onClose,
    open,
    linkedClient,
    conversationId,
    clientPic,
    onOrderCreated,
  }: ClientOrderDrawerProps) => {
    const { t } = useTranslation();
    const {
      catalogSearchLoading,
      createLoading,
      form,
      handleCatalogSearch,
      handleDrawerClose,
      handlePlaceOrder,
      handleVariantSelect,
      minSearchLength,
      novaPoshtaDelivery,
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
      <Drawer
          title={
            <S.DrawerTitle>
              <S.DrawerEyebrow>
                {t("conversation.clientOrders.newRecord")}
              </S.DrawerEyebrow>
              <S.DrawerHeading>
                {t("conversation.clientOrders.drawerTitle")}
              </S.DrawerHeading>
            </S.DrawerTitle>
          }
          closable={{
            "aria-label": t("conversation.clientOrders.closeDrawerAria"),
          }}
          keyboard={false}
          maskClosable={false}
          onClose={handleDrawerClose}
          open={open}
          size={640}
          destroyOnHidden
          styles={{
            header: {
              padding: "18px 18px 14px",
            },
            body: {
              padding: "18px",
            },
            footer: {
              padding: "14px 18px 16px",
            },
          }}
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
          <S.DrawerContent>
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

            <S.Section>
              <S.SectionHeader>
                {sectionTitle(
                  3,
                  t("conversation.clientOrders.drawer.sectionOrderDetails"),
                )}
              </S.SectionHeader>
              <S.FormPanel>
                <ClientOrderDeliveryForm
                  form={form}
                  novaPoshtaDelivery={novaPoshtaDelivery}
                />
              </S.FormPanel>
            </S.Section>
          </S.DrawerContent>
        </Drawer>
    );
  },
);
