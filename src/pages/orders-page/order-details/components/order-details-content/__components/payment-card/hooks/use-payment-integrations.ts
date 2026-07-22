import { useEffect, useState } from "react";

import { integrationsApi } from "@/features/integrations/api/integrations-api";
import type { PaymentIntegration } from "@/features/integrations/model/integration.types";
import { unknownErrorMessage } from "@/utils/unknown-error-message";

type UsePaymentIntegrationsResult = {
  integrations: PaymentIntegration[];
  loading: boolean;
  error: string | null;
};

function isConnectedIntegration(integration: PaymentIntegration): boolean {
  return integration.status === "connected";
}

export function usePaymentIntegrations(
  enabled: boolean,
): UsePaymentIntegrationsResult {
  const [integrations, setIntegrations] = useState<PaymentIntegration[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;

    const loadIntegrations = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await integrationsApi.listPaymentIntegrations();
        const connected = (response.integrations ?? []).filter(
          isConnectedIntegration,
        );

        if (!cancelled) {
          setIntegrations(connected);
        }
      } catch (loadError) {
        if (!cancelled) {
          setIntegrations([]);
          setError(unknownErrorMessage(loadError));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadIntegrations();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { integrations, loading, error };
}
