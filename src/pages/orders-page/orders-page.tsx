import { ordersSectionNavItems } from "@/app/router/navigation";
import { DesktopSectionShell } from "@/components/settings/desktop-section-shell/desktop-section-shell";

export const OrdersPage = () => {
  return (
    <DesktopSectionShell
      items={ordersSectionNavItems}
      navDataQa="layout-orders-primary-nav"
      titleKey="orders.shellTitle"
    />
  );
};
