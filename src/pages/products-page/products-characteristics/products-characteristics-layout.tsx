import { observer } from "mobx-react-lite";
import { Outlet } from "react-router";

import { PaneNavSplitLayout } from "@/components/layout/pane-nav-split-layout";

import { CharacteristicCreateModal } from "./components/characteristic-create-modal";
import { ProductsCharacteristicsSidebar } from "./components/products-characteristics-sidebar";
import { useProductsCharacteristicsLayoutController } from "./controllers/use-products-characteristics-layout-controller";

export const ProductsCharacteristicsLayout = observer(() => {
  const controller = useProductsCharacteristicsLayoutController();

  return (
    <>
      <PaneNavSplitLayout.Root
        data-qa="layout-products-characteristics-shell"
        customWidth={350}
      >
        <ProductsCharacteristicsSidebar
          characteristics={controller.visibleCharacteristics}
          totalCount={controller.store.items.length}
          activeCharacteristicId={controller.activeCharacteristicId}
          searchValue={controller.searchValue}
          onSearchChange={controller.setSearchValue}
          onCreateClick={controller.openCreate}
          onCharacteristicClick={controller.navigateToCharacteristic}
        />
        <PaneNavSplitLayout.SubMain data-qa="layout-products-characteristics-main">
          <Outlet
            context={
              {
                onCreateClick: controller.openCreate,
              } satisfies ProductsCharacteristicsOutletContext
            }
          />
        </PaneNavSplitLayout.SubMain>
      </PaneNavSplitLayout.Root>

      <CharacteristicCreateModal
        form={controller.form}
        open={controller.createModalOpen}
        confirmLoading={controller.store.saveLoading}
        onCancel={controller.closeCreate}
        onCreate={controller.handleCreate}
      />
    </>
  );
});

export type ProductsCharacteristicsOutletContext = {
  onCreateClick: () => void;
};
