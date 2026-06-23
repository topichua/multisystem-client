import { Button, Empty, Spin } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { Navigate, useOutletContext } from "react-router";

import { getProductCategoryPath } from "@/app/router/pages-map";
import { useCategoriesStore } from "@/features/categories/model/use-categories-store";

import type { ProductsCategoriesOutletContext } from "./products-categories-layout";
import { getRootCategories } from "./products-categories.utils";

export const ProductsCategoriesIndex = observer(() => {
  const { t } = useTranslation();
  const { onCreateClick } = useOutletContext<ProductsCategoriesOutletContext>();
  const store = useCategoriesStore();

  if (store.listLoading && store.categories.length === 0) {
    return <Spin style={{ marginTop: 24 }} />;
  }

  const rootCategories = getRootCategories(store.categories);

  if (rootCategories.length > 0) {
    return (
      <Navigate to={getProductCategoryPath(rootCategories[0].id)} replace />
    );
  }

  return (
    <Empty description={t("categories.emptyState")} style={{ marginTop: 48 }}>
      <Button type="primary" onClick={onCreateClick}>
        {t("categories.createCategory")}
      </Button>
    </Empty>
  );
});
