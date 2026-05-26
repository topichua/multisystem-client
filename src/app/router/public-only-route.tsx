import { Navigate, Outlet, useLocation, type Location } from "react-router";

import { useAuth } from "@/features/auth/model/use-auth";

import { pagesMap } from "./pages-map";

type LocationState = {
  from?: Location;
};

export const PublicOnlyRoute = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (isAuthenticated) {
    const state = location.state as LocationState | null;
    const from = state?.from;
    const redirectTo = from
      ? `${from.pathname}${from.search}${from.hash}`
      : pagesMap.home;

    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};
