export const ONBOARDING_TOUR_TARGETS = {
  sider: '[data-qa="layout-app-sider"]',
  createButton: '[data-qa="layout-desktop-create-button"]',
  search: '[data-qa="layout-desktop-search"]',
  profile: '[data-qa="layout-desktop-profile-link"]',
  workStatus: '[data-qa="layout-desktop-work-status"]',
  theme: '[data-qa="layout-desktop-theme-toggle"]',
} as const;

export function queryOnboardingTourTarget(selector: string): HTMLElement {
  return document.querySelector(selector) as HTMLElement;
}
