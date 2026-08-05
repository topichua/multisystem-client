import { Outlet } from "react-router";

import { ClientsMobilePageShell } from "./clients-mobile-page-shell.styled";

export const ClientsPage = () => {
  return (
    <ClientsMobilePageShell>
      <Outlet />
    </ClientsMobilePageShell>
  );
};
