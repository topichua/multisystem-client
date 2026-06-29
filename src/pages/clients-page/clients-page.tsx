import type { ReactNode } from "react";

import { clientsSectionNavItems } from "@/app/router/navigation";
import { DesktopSectionShell } from "@/components/settings/desktop-section-shell/desktop-section-shell";

import { ClientsMobilePageShell } from "./clients-mobile-page-shell.styled";

export const ClientsPage = () => {
  return (
    <DesktopSectionShell
      items={clientsSectionNavItems}
      mobileWrapper={(children: ReactNode) => (
        <ClientsMobilePageShell>{children}</ClientsMobilePageShell>
      )}
      navDataQa="layout-clients-primary-nav"
      titleKey="clients.shellTitle"
    />
  );
};
