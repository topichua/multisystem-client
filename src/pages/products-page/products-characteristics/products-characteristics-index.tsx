import { Button, Empty, Spin } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { Navigate, useOutletContext } from "react-router";

import { getProductCharacteristicPath } from "@/app/router/pages-map";
import { useCharacteristicsStore } from "@/features/characteristics/model/use-characteristics-store";

import type { ProductsCharacteristicsOutletContext } from "./products-characteristics-layout";
import { sortCharacteristicsByOrder } from "./products-characteristics.utils";

export const ProductsCharacteristicsIndex = observer(() => {
  const { t } = useTranslation();
  const { onCreateClick } =
    useOutletContext<ProductsCharacteristicsOutletContext>();
  const store = useCharacteristicsStore();

  if (store.listLoading && store.items.length === 0) {
    return <Spin style={{ marginTop: 24 }} />;
  }

  if (store.items.length > 0) {
    const [firstCharacteristic] = sortCharacteristicsByOrder(store.items);

    return (
      <Navigate
        to={getProductCharacteristicPath(firstCharacteristic.id)}
        replace
      />
    );
  }

  return (
    <Empty
      description={t("characteristics.emptyState")}
      style={{ marginTop: 48 }}
    >
      <Button type="primary" onClick={onCreateClick}>
        {t("characteristics.createCharacteristic")}
      </Button>
    </Empty>
  );
});
