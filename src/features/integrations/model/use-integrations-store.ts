import { IntegrationsStore } from "./integrations-store";

const singleton = new IntegrationsStore();

export function useIntegrationsStore(): IntegrationsStore {
  return singleton;
}
