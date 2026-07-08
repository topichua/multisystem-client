import type { Client } from "@/features/clients/model/client.types";
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
      catalogSearchProductGroups,
      categoriesLoading,
      categorySelectOptions,
      catalogSearchLoading,
      catalogSearchMode,
      createLoading,
      form,
      handleCatalogSearchClear,
      handleCatalogSearchModeChange,
      handleCategoryChange,
      handleCatalogSearch,
      handleDrawerClose,
      handlePlaceOrder,
      handleVariantSelect,
      handleWithoutDeliveryChange,
      minSearchLength,
      novaPoshtaDelivery,
      orderLines,
      orderTotals,
      productPickerKey,
      removeLine,
      selectedCategoryId,
      trimmedSearch,
      updateLineQuantity,
      variantSelectOptions,
      withoutDelivery,
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
            <S.DrawerHeading>
              {t("conversation.clientOrders.drawerTitle")}
            </S.DrawerHeading>
          </S.DrawerTitle>
        }
        closable={{
          "aria-label": t("conversation.clientOrders.closeDrawerAria"),
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
            catalogSearchProductGroups={catalogSearchProductGroups}
            categoriesLoading={categoriesLoading}
            categorySelectOptions={categorySelectOptions}
            catalogSearchLoading={catalogSearchLoading}
            catalogSearchMode={catalogSearchMode}
            minSearchLength={minSearchLength}
            orderLines={orderLines}
            productPickerKey={productPickerKey}
            selectedCategoryId={selectedCategoryId}
            title={sectionTitle(
              2,
              t("conversation.clientOrders.drawer.sectionProducts"),
            )}
            trimmedSearch={trimmedSearch}
            variantSelectOptions={variantSelectOptions}
            onCategoryChange={handleCategoryChange}
            onCatalogSearchClear={handleCatalogSearchClear}
            onProductSearch={handleCatalogSearch}
            onSearchModeChange={handleCatalogSearchModeChange}
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
