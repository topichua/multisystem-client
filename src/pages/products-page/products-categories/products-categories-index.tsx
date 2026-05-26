import { Button, Empty, Spin } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { Navigate, useOutletContext } from "react-router";

import { getProductCategoryPath } from "@/app/router/pages-map";
import { flattenCategories } from "@/features/categories/model/category-tree";
import { useCategoriesStore } from "@/features/categories/model/use-categories-store";

import type { ProductsCategoriesOutletContext } from "./products-categories-layout";

export const ProductsCategoriesIndex = observer(() => {
  const { t } = useTranslation();
  const { onCreateClick } = useOutletContext<ProductsCategoriesOutletContext>();
  const store = useCategoriesStore();

  if (store.listLoading && store.categories.length === 0) {
    return <Spin style={{ marginTop: 24 }} />;
  }

  const flat = flattenCategories(store.categories);

  if (flat.length > 0) {
    return <Navigate to={getProductCategoryPath(flat[0].id)} replace />;
  }

  return (
    <Empty description={t("categories.emptyState")} style={{ marginTop: 48 }}>
      <Button type="primary" onClick={onCreateClick}>
        {t("categories.createCategory")}
      </Button>
    </Empty>
  );
});
