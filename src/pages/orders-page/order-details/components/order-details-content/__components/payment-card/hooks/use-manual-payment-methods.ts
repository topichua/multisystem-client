import { useEffect, useState } from "react";

import { integrationsApi } from "@/features/integrations/api/integrations-api";
import type { ManualPaymentMethod } from "@/features/integrations/model/integration.types";
import { unknownErrorMessage } from "@/utils/unknown-error-message";

type UseManualPaymentMethodsResult = {
  methods: ManualPaymentMethod[];
  loading: boolean;
  error: string | null;
};

export function useManualPaymentMethods(
  enabled: boolean,
): UseManualPaymentMethodsResult {
  const [methods, setMethods] = useState<ManualPaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;

    const loadMethods = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await integrationsApi.listManualPaymentMethods();

        if (!cancelled) {
          setMethods(response.items ?? []);
        }
      } catch (loadError) {
        if (!cancelled) {
          setMethods([]);
          setError(unknownErrorMessage(loadError));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadMethods();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { methods, loading, error };
}
