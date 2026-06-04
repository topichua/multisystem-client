import { Button, Empty, Spin } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { useOutletContext } from "react-router";

import { useCharacteristicsStore } from "@/features/characteristics/model/use-characteristics-store";

import type { ProductsCharacteristicsOutletContext } from "./products-characteristics-layout";

export const ProductsCharacteristicsIndex = observer(() => {
  const { t } = useTranslation();
  const { onCreateClick } =
    useOutletContext<ProductsCharacteristicsOutletContext>();
  const store = useCharacteristicsStore();

  if (store.listLoading && store.items.length === 0) {
    return <Spin style={{ marginTop: 24 }} />;
  }

  if (store.items.length > 0) {
    return (
      <Empty
        description={t("characteristics.selectCharacteristic")}
        style={{ marginTop: 48 }}
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
