import type { DrawerProps } from "antd";

type InventoryDrawerLayoutOptions = {
  isMobile: boolean;
  desktopSize: number;
};

export function getInventoryDrawerLayoutProps({
  isMobile,
  desktopSize,
}: InventoryDrawerLayoutOptions): Pick<
  DrawerProps,
  "placement" | "size" | "height" | "push" | "styles"
> {
  if (isMobile) {
    return {
      placement: "bottom",
      height: "100dvh",
      push: false,
      styles: {
        body: {
          padding: "0 16px calc(16px + env(safe-area-inset-bottom, 0px))",
          overflowY: "auto",
        },
        header: { padding: "12px 16px" },
        footer: {
          padding: "12px 16px calc(12px + env(safe-area-inset-bottom, 0px))",
        },
      },
    };
  }

  return {
    placement: "right",
    size: desktopSize,
    push: true,
  };
}
