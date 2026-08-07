import { settingsSectionNavGroups } from "@/app/router/navigation";
import { DesktopSectionShell } from "@/components/settings/desktop-section-shell/desktop-section-shell";

export const SettingsPage = () => {
  return (
    <DesktopSectionShell
      groups={settingsSectionNavGroups}
      navDataQa="layout-settings-primary-nav"
      titleKey="settings.title"
    />
  );
};
