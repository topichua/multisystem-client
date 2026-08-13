const COMPLETED_KEY_PREFIX = "multisale.onboardingTour.v1";
const SESSION_DISMISSED_KEY = "multisale.onboardingTour.sessionDismissed";

function completedStorageKey(userId: number): string {
  return `${COMPLETED_KEY_PREFIX}.${userId}`;
}

export function isOnboardingTourCompleted(userId: number): boolean {
  try {
    return localStorage.getItem(completedStorageKey(userId)) === "completed";
  } catch {
    return false;
  }
}

export function markOnboardingTourCompleted(userId: number): void {
  try {
    localStorage.setItem(completedStorageKey(userId), "completed");
  } catch {
    // ignore
  }
}

export function clearOnboardingTourCompleted(userId: number): void {
  try {
    localStorage.removeItem(completedStorageKey(userId));
  } catch {
    // ignore
  }
}

export function isOnboardingTourSessionDismissed(): boolean {
  try {
    return sessionStorage.getItem(SESSION_DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

export function markOnboardingTourSessionDismissed(): void {
  try {
    sessionStorage.setItem(SESSION_DISMISSED_KEY, "1");
  } catch {
    // ignore
  }
}

export function clearOnboardingTourSessionDismissed(): void {
  try {
    sessionStorage.removeItem(SESSION_DISMISSED_KEY);
  } catch {
    // ignore
  }
}

/** Clears finish + skip flags so the tour can auto-start again on home. */
export function resetOnboardingTourForReplay(userId: number): void {
  clearOnboardingTourCompleted(userId);
  clearOnboardingTourSessionDismissed();
}
