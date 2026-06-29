import type { ReactElement } from "react";

import { useIsMobileViewport } from "@/utils/use-media-query";

type ViewportRouteProps = {
  mobile: ReactElement;
  desktop: ReactElement;
};

export const ViewportRoute = ({ mobile, desktop }: ViewportRouteProps) => {
  const isMobileViewport = useIsMobileViewport();

  return isMobileViewport ? mobile : desktop;
};
