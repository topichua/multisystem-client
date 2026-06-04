import { useContext } from "react";

import { CharacteristicsStoreContext } from "./characteristics-store-context";
import type { CharacteristicsStore } from "./characteristics-store";

export const useCharacteristicsStore = (): CharacteristicsStore => {
  const store = useContext(CharacteristicsStoreContext);

  if (!store) {
    throw new Error(
      "useCharacteristicsStore must be used within CharacteristicsProvider",
    );
  }

  return store;
};
