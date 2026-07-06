import { useEffect, useState } from "react";

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
  const [remoteClient, setRemoteClient] = useState<RemoteClientState | null>(
    null,
  );

  useEffect(() => {
    if (!enabled || clientId == null) {
      return;
    }

    let cancelled = false;

    void clientsApi.getById(clientId).then(
      (data) => {
        if (!cancelled) {
          setRemoteClient({ clientId, client: data });
        }
      },
      () => {
        if (!cancelled) {
          setRemoteClient({ clientId, client: null });
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [clientId, enabled]);

  if (!enabled || clientId == null) {
    return { client: null, loading: false };
  }

  const client =
    remoteClient?.clientId === clientId ? remoteClient.client : null;
  const loading = remoteClient == null || remoteClient.clientId !== clientId;

  return { client, loading };
}
