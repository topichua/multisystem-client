import { useState, type ReactNode } from "react";

import { CharacteristicsStoreContext } from "./characteristics-store-context";
import { CharacteristicsStore } from "./characteristics-store";

type CharacteristicsProviderProps = {
  children: ReactNode;
};

export const CharacteristicsProvider = ({
  children,
}: CharacteristicsProviderProps) => {
  const [store] = useState(() => new CharacteristicsStore());

  return (
    <CharacteristicsStoreContext.Provider value={store}>
      {children}
    </CharacteristicsStoreContext.Provider>
  );
};
