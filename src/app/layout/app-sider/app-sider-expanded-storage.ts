const STORAGE_KEY = "multisale.appSiderExpanded";

export function readStoredAppSiderExpanded(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "true") {
      return true;
    }
    if (raw === "false") {
      return false;
    }
  } catch {
    /* ignore */
  }
  return false;
}

export function writeStoredAppSiderExpanded(expanded: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(expanded));
  } catch {
    /* ignore */
  }
}
