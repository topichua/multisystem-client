import type { ReactNode } from "react";

import { teamSectionNavItems } from "@/app/router/navigation";
import { DesktopSectionShell } from "@/components/settings/desktop-section-shell/desktop-section-shell";

import { TeamMobilePageShell } from "./team-mobile-page-shell.styled";

export const TeamPage = () => {
  return (
    <DesktopSectionShell
      items={teamSectionNavItems}
      mobileWrapper={(children: ReactNode) => (
        <TeamMobilePageShell>{children}</TeamMobilePageShell>
      )}
      navDataQa="layout-team-primary-nav"
      titleKey="team.shellTitle"
    />
  );
};
