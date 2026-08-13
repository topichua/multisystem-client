import { Outlet } from "react-router";

import { AppSider } from "@/app/layout/app-sider/app-sider";
import { DesktopAppHeader } from "@/app/layout/desktop-app-header/desktop-app-header";
import { MobileAppHeader } from "@/app/layout/mobile-app-header/mobile-app-header";
import { AppOnboardingTour } from "@/app/layout/onboarding-tour/app-onboarding-tour";

import * as S from "./home-page.styled";

export const HomePage = () => {
  return (
    <S.PageLayout>
      <DesktopAppHeader />
      <AppSider />
      <MobileAppHeader />
      <S.WorkspaceLayout>
        <Outlet />
      </S.WorkspaceLayout>
      <AppOnboardingTour />
    </S.PageLayout>
  );
};
