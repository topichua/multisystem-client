import type { Client } from "@/features/clients/model/client.types";
import type { CatalogVariant } from "@/features/products/model/product.types";
import { observer } from "mobx-react-lite";
import { Drawer, Switch } from "antd";
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
  suggestedVariantToAdd?: CatalogVariant | null;
  onOrderDraftVariantIdsChange?: (variantIds: Set<number>) => void;
  onSuggestedVariantConsumed?: () => void;
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
    suggestedVariantToAdd,
    onOrderDraftVariantIdsChange,
    onSuggestedVariantConsumed,
    onOrderCreated,
  }: ClientOrderDrawerProps) => {
    const { t } = useTranslation();
    const {
      catalogSearch,
      createLoading,
      form,
      handleDrawerClose,
      handlePlaceOrder,
      handleWithoutDeliveryChange,
      novaPoshtaDelivery,
      orderLines,
      orderTotals,
      removeLine,
      selectedVariantIds,
      updateLineQuantity,
      withoutDelivery,
      addVariantToOrder,
    } = useClientOrderCreateController({
      conversationId,
      linkedClient,
      suggestedVariantToAdd,
      onClose,
      onOrderDraftVariantIdsChange,
      onOrderCreated,
      onSuggestedVariantConsumed,
    });

    return (
      <Drawer
        title={
          <S.DrawerTitle>
            <S.DrawerHeading>
              {t("conversation.clientOrders.drawerTitle")}
            </S.DrawerHeading>
          </S.DrawerTitle>
        }
        closable={{
          "aria-label": t("conversation.clientOrders.closeDrawerAria"),
          placement: "end",
        }}
        keyboard={false}
        mask={{
          closable: false,
        }}
        onClose={handleDrawerClose}
        open={open}
        size={440}
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
            form={form}
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
            catalogSearch={catalogSearch}
            orderLines={orderLines}
            selectedVariantIds={selectedVariantIds}
            title={sectionTitle(
              2,
              t("conversation.clientOrders.drawer.sectionProducts"),
            )}
            onQuantityChange={updateLineQuantity}
            onRemoveLine={removeLine}
            onVariantSelect={addVariantToOrder}
          />

          <S.Section>
            <S.SectionHeader>
              {sectionTitle(
                3,
                t("conversation.clientOrders.drawer.sectionOrderDetails"),
              )}
              <S.NoDeliveryToggle>
                <span>
                  {t("conversation.clientOrders.drawer.withoutDelivery")}
                </span>
                <Switch
                  checked={withoutDelivery}
                  onChange={handleWithoutDeliveryChange}
                />
              </S.NoDeliveryToggle>
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
