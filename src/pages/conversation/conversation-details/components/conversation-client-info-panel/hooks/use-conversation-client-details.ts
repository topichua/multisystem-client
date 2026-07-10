import { useCallback, useEffect, useState } from "react";

import { clientsApi } from "@/features/clients/api/clients-api";
import type { Client } from "@/features/clients/model/client.types";

type RemoteClientState = {
  clientId: number;
  client: Client | null;
};

export function useConversationClientDetails(
  clientId: number | undefined,
  enabled: boolean,
) {
  const [reloadToken, setReloadToken] = useState(0);
  const [remoteClient, setRemoteClient] = useState<RemoteClientState | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  const reload = useCallback(() => {
    setReloadToken((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!enabled || clientId == null) {
      return;
    }

    let cancelled = false;

    const loadClient = async () => {
      setLoading(true);

      try {
        const data = await clientsApi.getById(clientId);

        if (!cancelled) {
          setRemoteClient({ clientId, client: data });
        }
      } catch {
        if (!cancelled) {
          setRemoteClient({ clientId, client: null });
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
  }, [clientId, enabled, reloadToken]);

  if (!enabled || clientId == null) {
    return { client: null, loading: false, reload };
  }

  const client =
    remoteClient?.clientId === clientId ? remoteClient.client : null;
  const isLoading =
    loading || remoteClient == null || remoteClient.clientId !== clientId;

  return { client, loading: isLoading, reload };
}
