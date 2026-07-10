import { useEffect } from "react";

import { useIntegrationsStore } from "@/features/integrations/model/use-integrations-store";

type UseEnsureIntegrationsLoadedOptions = {
  silent?: boolean;
};

export const useEnsureIntegrationsLoaded = (
  options?: UseEnsureIntegrationsLoadedOptions,
): void => {
  const integrationsStore = useIntegrationsStore();
  const silent = options?.silent !== false;

  useEffect(() => {
    if (
      integrationsStore.items.length === 0 &&
      !integrationsStore.listLoading
    ) {
      void integrationsStore.loadIntegrations({ silent });
    }
  }, [
    integrationsStore,
    integrationsStore.items.length,
    integrationsStore.listLoading,
    silent,
  ]);
};
