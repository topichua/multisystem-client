import { Alert, Button, Flex } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import { CenteredSpinner } from "@/components/loading/centered-spinner";

import { CategoryDangerZone } from "./components/category-danger-zone";
import { CategoryDetailHeader } from "./components/category-detail-header";
import { SubcategoriesSection } from "./components/subcategories-section";
import { useProductCategoryDetailController } from "./controllers/use-product-category-detail-controller";

export const ProductCategoryDetailView = () => {
  const { categoryId } = useParams<{ categoryId: string }>();

  return <ProductCategoryDetailContent key={categoryId ?? "missing"} />;
};

const ProductCategoryDetailContent = observer(() => {
  const { t } = useTranslation();
  const controller = useProductCategoryDetailController();

  if (controller.isInvalidCategoryId) {
    return <Alert type="error" title={t("categories.invalidId")} showIcon />;
  }

  if (controller.isPageLoading) {
    return <CenteredSpinner />;
  }

  if (controller.isNotFound) {
    return (
      <Alert
        type="warning"
        title={t("categories.notFoundTitle")}
        description={t("categories.notFoundDescription")}
        showIcon
        action={
          <Button size="small" onClick={controller.navigateToCategories}>
            {t("categories.backToList")}
          </Button>
        }
      />
    );
  }

  if (!controller.category) {
    return null;
  }

  return (
    <>
      {controller.contextHolder}

      <PaneDetailLayout.Root>
        <PaneDetailLayout.Header>
          <CategoryDetailHeader
            category={controller.category}
            subcategoriesCount={controller.subcategories.length}
            saveLoading={controller.saveLoading}
            nameEdit={controller.categoryNameEdit}
          />
        </PaneDetailLayout.Header>

        <PaneDetailLayout.Body>
          <Flex
            vertical
            gap={20}
            style={{ maxWidth: 780, margin: "20px auto" }}
          >
            <SubcategoriesSection
              subcategories={controller.subcategories}
              create={controller.subcategoryCreate}
              rename={controller.subcategoryRename}
              saveLoading={controller.saveLoading}
              deleteLoadingId={controller.deleteLoadingId}
              onDeleteSubcategory={controller.onDeleteSubcategory}
            />

            <CategoryDangerZone
              deleteBlockedByApi={controller.deleteBlockedByApi}
              deleteLoading={
                controller.deleteLoadingId === controller.category.id
              }
              onDelete={controller.onDeleteCategory}
            />
          </Flex>
        </PaneDetailLayout.Body>
      </PaneDetailLayout.Root>
    </>
  );
});
