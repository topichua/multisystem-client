import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router";

import { clientsApi } from "@/features/clients/api/clients-api";
import type { Client } from "@/features/clients/model/client.types";
import { useClientsStore } from "@/features/clients/model/use-clients-store";
import { throwLoadError } from "@/utils/throw-load-error";
import { unknownErrorMessage } from "@/utils/unknown-error-message";

import { readClientFromLocationState } from "../utils/client-details.utils";

function findClientInStore(
  clients: Client[],
  clientId: number,
): Client | undefined {
  return clients.find((client) => client.id === clientId);
}

type RemoteClientState = {
  clientId: number;
  client: Client | null;
};

export function useClientDetails(clientId: number | null) {
  const location = useLocation();
  const clientsStore = useClientsStore();

  const cachedClient =
    clientId != null
      ? (readClientFromLocationState(location.state, clientId) ??
        findClientInStore(clientsStore.clients, clientId) ??
        null)
      : null;

  const [remoteClient, setRemoteClient] = useState<RemoteClientState | null>(
    null,
  );
  const [clientOverride, setClientOverride] = useState<Client | null>(null);
  const [overrideForClientId, setOverrideForClientId] = useState(clientId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (clientId !== overrideForClientId) {
    setOverrideForClientId(clientId);
    setClientOverride(null);
  }

  useEffect(() => {
    if (clientId == null || cachedClient != null) {
      return;
    }

    let cancelled = false;

    const loadClient = async () => {
      setLoading(true);
      setError(null);

      try {
        const client = await clientsApi.getById(clientId);

        if (cancelled) {
          return;
        }

        setRemoteClient({
          clientId,
          client,
        });
      } catch (e) {
        if (!cancelled) {
          setRemoteClient({
            clientId,
            client: null,
          });
          setError(unknownErrorMessage(e));
          throwLoadError(`Failed to resolve client ${clientId}`, e);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadClient();

    return () => {
      cancelled = true;
    };
  }, [cachedClient, clientId]);

  const applyClientUpdate = useCallback((client: Client) => {
    setClientOverride(client);
  }, []);

  if (clientId == null) {
    return {
      client: null,
      loading: false,
      error: null,
      applyClientUpdate,
    };
  }

  const overrideClient =
    clientOverride?.id === clientId ? clientOverride : null;

  if (overrideClient) {
    return {
      client: overrideClient,
      loading: false,
      error: null,
      applyClientUpdate,
    };
  }

  if (cachedClient) {
    return {
      client: cachedClient,
      loading: false,
      error: null,
      applyClientUpdate,
    };
  }

  const resolvedRemoteClient =
    remoteClient?.clientId === clientId ? remoteClient.client : null;
  const isResolving =
    loading || remoteClient == null || remoteClient.clientId !== clientId;

  return {
    client: resolvedRemoteClient,
    loading: isResolving,
    error,
    applyClientUpdate,
  };
}
