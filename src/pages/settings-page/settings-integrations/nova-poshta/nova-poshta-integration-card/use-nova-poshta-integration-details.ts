import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { integrationsApi } from "@/features/integrations/api/integrations-api";
import type { NovaPoshtaIntegrationDetails } from "@/features/integrations/model/integration.types";

import { findNovaPoshtaIntegrationDetails } from "./nova-poshta-integration-card.helpers";

type UseNovaPoshtaIntegrationDetailsParams = {
  integrationId: string;
};

type UseNovaPoshtaIntegrationDetailsResult = {
  details: NovaPoshtaIntegrationDetails | null;
  error: string | null;
  isLoading: boolean;
  reload: () => void;
  setDetails: (details: NovaPoshtaIntegrationDetails) => void;
};

export function useNovaPoshtaIntegrationDetails({
  integrationId,
}: UseNovaPoshtaIntegrationDetailsParams): UseNovaPoshtaIntegrationDetailsResult {
  const { t } = useTranslation();
  const [details, setDetails] = useState<NovaPoshtaIntegrationDetails | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);
  const requestIdRef = useRef(0);

  const reload = useCallback(() => {
    setDetails(null);
    setError(null);
    setIsLoading(true);
    setReloadToken((token) => token + 1);
  }, []);

  useEffect(() => {
    const abortController = new AbortController();
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    void integrationsApi
      .getNovaPoshtaIntegrations({ signal: abortController.signal })
      .then((items) => {
        if (
          abortController.signal.aborted ||
          requestIdRef.current !== requestId
        ) {
          return;
        }

        const nextDetails = findNovaPoshtaIntegrationDetails(
          items,
          integrationId,
        );

        if (!nextDetails) {
          setDetails(null);
          setError(t("integrations.novaPoshtaDetails.notFound"));
          return;
        }

        setDetails(nextDetails);
        setError(null);
      })
      .catch((requestError) => {
        if (
          abortController.signal.aborted ||
          requestIdRef.current !== requestId
        ) {
          return;
        }

        setDetails(null);
        setError(
          getApiErrorMessage(
            requestError,
            t("integrations.novaPoshtaDetails.loadFailed"),
          ),
        );
      })
      .finally(() => {
        if (
          !abortController.signal.aborted &&
          requestIdRef.current === requestId
        ) {
          setIsLoading(false);
        }
      });

    return () => {
      abortController.abort();
    };
  }, [integrationId, reloadToken, t]);

  return {
    details,
    error,
    isLoading,
    reload,
    setDetails,
  };
}
