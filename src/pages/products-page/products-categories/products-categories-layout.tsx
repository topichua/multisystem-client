import { observer } from "mobx-react-lite";
import { Outlet } from "react-router";

import { PaneNavSplitLayout } from "@/components/layout/pane-nav-split-layout";

import { CategoryCreateModal } from "./components/category-create-modal";
import { ProductsCategoriesSidebar } from "./components/products-categories-sidebar";
import { useProductsCategoriesLayoutController } from "./controllers/use-products-categories-layout-controller";

export const ProductsCategoriesLayout = observer(() => {
  const controller = useProductsCategoriesLayoutController();

  return (
    <>
      {controller.contextHolder}
      <PaneNavSplitLayout.Root
        data-qa="layout-products-categories-shell"
        customWidth={350}
      >
        <ProductsCategoriesSidebar
          categories={controller.visibleCategories}
          totalCount={controller.store.categories.length}
          activeCategoryId={controller.activeCategoryId}
          searchValue={controller.searchValue}
          onSearchChange={controller.setSearchValue}
          onCreateClick={controller.openCreate}
          onCategoryClick={controller.navigateToCategory}
        />
        <PaneNavSplitLayout.SubMain data-qa="layout-products-categories-main">
          <Outlet
            context={
              {
                onCreateClick: controller.openCreate,
              } satisfies ProductsCategoriesOutletContext
            }
          />
        </PaneNavSplitLayout.SubMain>
      </PaneNavSplitLayout.Root>

      <CategoryCreateModal
        form={controller.form}
        open={controller.createModalOpen}
        parentCategoryOptions={controller.parentCategoryOptions}
        confirmLoading={controller.store.saveLoading}
        onCancel={controller.closeCreate}
        onCreate={controller.handleCreate}
      />
    </>
  );
});

export type ProductsCategoriesOutletContext = {
  onCreateClick: () => void;
};
