import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { SettingsShell } from "@/components/settings/settings-shell/settings-shell";

import type { InstagramPageController } from "../../controllers/use-instagram-page-controller";
import { InstagramIntegrationsSidebar } from "../integrations/instagram-integrations-sidebar";

type InstagramPageShellProps = {
  controller: InstagramPageController;
  children: ReactNode;
  onSelectIntegration?: (key: string) => void;
};

export const InstagramPageShell = ({
  controller,
  children,
  onSelectIntegration,
}: InstagramPageShellProps) => {
  const { t } = useTranslation();
  const { store } = controller;

  return (
    <SettingsShell.Root>
      <SettingsShell.Sidebar $customWidth={280}>
        <SettingsShell.Title>{t("instagram.pageTitle")}</SettingsShell.Title>
        <SettingsShell.SidebarScroll>
          <div data-qa="layout-instagram-primary-nav">
            <InstagramIntegrationsSidebar
              integrations={store.integrations}
              loading={controller.initialListLoading}
              selectedKey={controller.selectedKey}
              onSelect={onSelectIntegration ?? controller.selectIntegrationKey}
            />
          </div>
        </SettingsShell.SidebarScroll>
      </SettingsShell.Sidebar>

      <SettingsShell.Content>{children}</SettingsShell.Content>
    </SettingsShell.Root>
  );
};
