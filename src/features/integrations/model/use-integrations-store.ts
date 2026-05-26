import { useMemo } from "react";

import { IntegrationsStore } from "./integrations-store";

let singleton: IntegrationsStore | null = null;

export function useIntegrationsStore(): IntegrationsStore {
  return useMemo(() => {
    if (!singleton) {
      singleton = new IntegrationsStore();
    }
    return singleton;
  }, []);
}
