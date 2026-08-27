import { observer } from "mobx-react-lite";

import { DesktopSectionShell } from "@/components/settings/desktop-section-shell/desktop-section-shell";

import { useProductsSectionNavItems } from "./use-products-section-nav-items";

export const ProductsPage = observer(() => {
  const items = useProductsSectionNavItems();

  return (
    <DesktopSectionShell
      items={items}
      navDataQa="layout-products-primary-nav"
      titleKey="products.shellTitle"
    />
  );
});
