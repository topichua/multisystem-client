import { productsSectionNavItems } from "@/app/router/navigation";
import { DesktopSectionShell } from "@/components/settings/desktop-section-shell/desktop-section-shell";

export const ProductsPage = () => {
  return (
    <DesktopSectionShell
      items={productsSectionNavItems}
      navDataQa="layout-products-primary-nav"
      titleKey="products.shellTitle"
    />
  );
};
