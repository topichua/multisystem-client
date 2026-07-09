import type { Client } from "@/features/clients/model/client.types";

import { ClientSearchResults } from "./client-search-results";
import { ExistingClientSearchInput } from "./existing-client-search-input";
import { SelectedClientCard } from "./selected-client-card";

type ExistingClientBlockProps = {
  clientSearchValue: string;
  clientsListError: string | null;
  clientsListLoading: boolean;
  clientsRequested: boolean;
  onClientClear: () => void;
  onClientSearchChange: (value: string) => void;
  onClientSelect: (client: Client) => void;
  onExistingClientSearchFocus: () => void;
  selectedClient: Client | null;
  visibleClients: Client[];
};

export function ExistingClientBlock({
  selectedClient,
  clientSearchValue,
  clientsListError,
  clientsListLoading,
  clientsRequested,
  visibleClients,
  onClientClear,
  onClientSelect,
  onClientSearchChange,
  onExistingClientSearchFocus,
}: ExistingClientBlockProps) {
  if (selectedClient) {
    return (
      <SelectedClientCard client={selectedClient} onClear={onClientClear} />
    );
  }

  return (
    <>
      <ExistingClientSearchInput
        value={clientSearchValue}
        onFocus={onExistingClientSearchFocus}
        onChange={onClientSearchChange}
      />

      <ClientSearchResults
        clientsRequested={clientsRequested}
        clientsListLoading={clientsListLoading}
        clientsListError={clientsListError}
        visibleClients={visibleClients}
        onClientSelect={onClientSelect}
      />
    </>
  );
}
