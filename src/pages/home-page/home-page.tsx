import { Outlet } from "react-router";

import { AppSider } from "@/app/layout/app-sider/app-sider";
import { MobileAppHeader } from "@/app/layout/mobile-app-header/mobile-app-header";

import * as S from "./home-page.styled";

export const HomePage = () => {
  return (
    <S.PageLayout>
      <AppSider />
      <MobileAppHeader />
      <S.WorkspaceLayout>
        <Outlet />
      </S.WorkspaceLayout>
    </S.PageLayout>
  );
};
