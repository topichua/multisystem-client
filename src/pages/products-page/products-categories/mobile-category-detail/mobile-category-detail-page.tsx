import { ArrowLeftIcon } from "@phosphor-icons/react";
import { Alert, Button } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import { CenteredSpinner } from "@/components/loading/centered-spinner";

import { CategoryDangerZone } from "../components/category-danger-zone";
import { CategoryDetailHeader } from "../components/category-detail-header";
import { SubcategoriesSection } from "../components/subcategories-section";
import { useProductCategoryDetailController } from "../controllers/use-product-category-detail-controller";
import * as S from "./mobile-category-detail-page.styled";

export const MobileCategoryDetailPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>();

  return <MobileCategoryDetailContent key={categoryId ?? "missing"} />;
};

const MobileCategoryDetailContent = observer(() => {
  const { t } = useTranslation();
  const controller = useProductCategoryDetailController();

  if (controller.isInvalidCategoryId) {
    return (
      <S.Root>
        <S.StateContainer>
          <Alert type="error" title={t("categories.invalidId")} showIcon />
        </S.StateContainer>
      </S.Root>
    );
  }

  if (controller.isPageLoading) {
    return (
      <S.Root>
        <S.StateContainer>
          <CenteredSpinner />
        </S.StateContainer>
      </S.Root>
    );
  }

  if (controller.isNotFound) {
    return (
      <S.Root>
        <S.StateContainer>
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
        </S.StateContainer>
      </S.Root>
    );
  }

  if (!controller.category) {
    return null;
  }

  const category = controller.category;

  return (
    <S.Root>
      <S.PageHeader>
        <S.BackButton
          type="text"
          icon={<ArrowLeftIcon size={16} />}
          aria-label={t("categories.mobile.backToCategoriesAria")}
          data-qa="products-mobile-category-back"
          onClick={controller.navigateToCategories}
        >
          {t("categories.backToList")}
        </S.BackButton>
      </S.PageHeader>

      <S.ScrollRegion>
        <S.ContentSection>
          <CategoryDetailHeader
            category={category}
            subcategoriesCount={controller.subcategories.length}
            saveLoading={controller.saveLoading}
            nameEdit={controller.categoryNameEdit}
            editDataQa={`products-mobile-category-edit-${category.id}`}
          />

          <S.SectionCard>
            <SubcategoriesSection
              subcategories={controller.subcategories}
              create={controller.subcategoryCreate}
              rename={controller.subcategoryRename}
              saveLoading={controller.saveLoading}
              deleteLoadingId={controller.deleteLoadingId}
              onDeleteSubcategory={controller.onDeleteSubcategory}
              addSubcategoryDataQa={`products-mobile-category-add-subcategory-${category.id}`}
              getSubcategoryItemDataQa={(subcategoryId) =>
                `products-mobile-subcategory-item-${subcategoryId}`
              }
            />
          </S.SectionCard>

          <S.FooterActions vertical gap={8}>
            <CategoryDangerZone
              deleteBlockedByApi={controller.deleteBlockedByApi}
              deleteLoading={controller.deleteLoadingId === category.id}
              onDelete={controller.onDeleteCategory}
              deleteDataQa={`products-mobile-category-delete-${category.id}`}
              mobileLayout
            />
          </S.FooterActions>
        </S.ContentSection>
      </S.ScrollRegion>
    </S.Root>
  );
});
