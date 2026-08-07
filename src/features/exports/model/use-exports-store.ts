import { useContext } from "react";

import type { ExportsStore } from "./exports-store";
import { ExportsStoreContext } from "./exports-store-context";

export const useExportsStore = (): ExportsStore => {
  const store = useContext(ExportsStoreContext);

  if (!store) {
    throw new Error("useExportsStore must be used within ExportsProvider");
  }

  return store;
};
