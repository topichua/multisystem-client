import { WorkspaceSettingsStore } from "./workspace-settings-store";

const singleton = new WorkspaceSettingsStore();

export function useWorkspaceSettingsStore(): WorkspaceSettingsStore {
  return singleton;
}
