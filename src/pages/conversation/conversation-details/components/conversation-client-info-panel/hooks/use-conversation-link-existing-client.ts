import { useCallback, useEffect, useRef, useState } from "react";

import { clientsApi } from "@/features/clients/api/clients-api";
import type {
  Client,
  ClientLinkProvider,
} from "@/features/clients/model/client.types";
import type { Conversation } from "@/features/conversations/model/types";

const MIN_SEARCH_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 300;

type UseConversationLinkExistingClientParams = {
  conversation: Conversation | undefined;
  onClientLinked: (client: Client) => void;
};

const getClientLinkProvider = (
  channel: Conversation["channel"],
): ClientLinkProvider | null => {
  if (channel === "telegram") {
    return "telegram";
  }

  if (channel === "instagram") {
    return "instagram";
  }

  return null;
};

export function useConversationLinkExistingClient({
  conversation,
  onClientLinked,
}: UseConversationLinkExistingClientParams) {
  const conversationId = conversation?.id;
  const [activeConversationId, setActiveConversationId] =
    useState(conversationId);
  const [linkSectionOpen, setLinkSectionOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [linkLoading, setLinkLoading] = useState(false);
  const searchRequestIdRef = useRef(0);

  const trimmedSearch = searchValue.trim();
  const searchRequested = trimmedSearch.length >= MIN_SEARCH_LENGTH;
  const isSearchActive = linkSectionOpen && searchRequested;

  const resetLinkState = useCallback(() => {
    searchRequestIdRef.current += 1;
    setLinkSectionOpen(false);
    setSearchValue("");
    setSearchResults([]);
    setSearchLoading(false);
    setSearchError(null);
    setSelectedClient(null);
    setLinkLoading(false);
  }, []);

  if (conversationId !== activeConversationId) {
    setActiveConversationId(conversationId);
    setLinkSectionOpen(false);
    setSearchValue("");
    setSearchResults([]);
    setSearchLoading(false);
    setSearchError(null);
    setSelectedClient(null);
    setLinkLoading(false);
  }

  useEffect(() => {
    if (!isSearchActive) {
      return;
    }

    const requestId = searchRequestIdRef.current + 1;
    searchRequestIdRef.current = requestId;

    const timeoutId = window.setTimeout(() => {
      setSearchLoading(true);
      setSearchError(null);

      void clientsApi
        .listClients({
          keyword: trimmedSearch,
          page: 1,
          pageSize: 20,
        })
        .then(
          (response) => {
            if (searchRequestIdRef.current !== requestId) {
              return;
            }

            setSearchResults(response.items);
            setSearchLoading(false);
          },
          () => {
            if (searchRequestIdRef.current !== requestId) {
              return;
            }

            setSearchResults([]);
            setSearchLoading(false);
            setSearchError("search_failed");
          },
        );
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
      searchRequestIdRef.current += 1;
    };
  }, [isSearchActive, trimmedSearch]);

  const handleOpenLinkSection = useCallback(() => {
    setLinkSectionOpen(true);
  }, []);

  const handleCloseLinkSection = useCallback(() => {
    setLinkSectionOpen(false);
    setSearchValue("");
    setSearchResults([]);
    setSearchError(null);
    setSelectedClient(null);
  }, []);

  const handleClientSelect = useCallback((client: Client) => {
    setSelectedClient(client);
    setSearchValue("");
    setSearchResults([]);
    setSearchError(null);
  }, []);

  const handleClearSelectedClient = useCallback(() => {
    setSelectedClient(null);
  }, []);

  const handleLinkClient = useCallback(async () => {
    if (!conversation || selectedClient == null) {
      return;
    }

    const provider = getClientLinkProvider(conversation.channel);
    const externalId =
      conversation.participant.id != null
        ? String(conversation.participant.id)
        : "";

    if (!provider || !externalId) {
      return false;
    }

    setLinkLoading(true);

    try {
      await clientsApi.createLink(selectedClient.id, {
        provider,
        externalId,
      });
      const linkedClient = await clientsApi.getById(selectedClient.id);
      onClientLinked(linkedClient);
      resetLinkState();
      return true;
    } catch {
      return false;
    } finally {
      setLinkLoading(false);
    }
  }, [conversation, onClientLinked, resetLinkState, selectedClient]);

  return {
    handleClearSelectedClient,
    handleClientSelect,
    handleCloseLinkSection,
    handleLinkClient,
    handleOpenLinkSection,
    linkLoading,
    linkSectionOpen,
    searchError: isSearchActive ? searchError : null,
    searchLoading: isSearchActive && searchLoading,
    searchRequested,
    searchResults: isSearchActive ? searchResults : [],
    searchValue,
    selectedClient,
    setSearchValue,
  };
}
