import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Navigate, useOutletContext } from "react-router";

import { getProductCharacteristicPath } from "@/app/router/pages-map";
import { CenteredSpinner } from "@/components/loading/centered-spinner";
import { useCharacteristicsStore } from "@/features/characteristics/model/use-characteristics-store";

import { CharacteristicsEmptyState } from "./components/characteristics-empty-state";
import { CharacteristicsLibraryGroupsSetup } from "./components/characteristics-library-groups-setup";
import type { ProductsCharacteristicsOutletContext } from "./products-characteristics-layout";
import { sortCharacteristicsByOrder } from "./products-characteristics.utils";

type EmptyView = "empty" | "library-setup";

export const ProductsCharacteristicsIndex = observer(() => {
  const { onCreateClick } =
    useOutletContext<ProductsCharacteristicsOutletContext>();
  const store = useCharacteristicsStore();
  const [emptyView, setEmptyView] = useState<EmptyView>("empty");

  if (store.listLoading && store.items.length === 0) {
    return <CenteredSpinner />;
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

  if (emptyView === "library-setup") {
    return (
      <CharacteristicsLibraryGroupsSetup
        onBack={() => setEmptyView("empty")}
      />
    );
  }

  return (
    <CharacteristicsEmptyState
      onCreateClick={onCreateClick}
      onAddLibraryClick={() => setEmptyView("library-setup")}
    />
  );
});
