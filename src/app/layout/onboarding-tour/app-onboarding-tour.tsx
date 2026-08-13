import { Tour, theme, type TourProps } from "antd";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import { createGlobalStyle } from "styled-components";

import { pagesMap } from "@/app/router/pages-map";
import { useUserStore } from "@/features/auth/model/use-user-store";
import { useIsMobileViewport } from "@/utils/use-media-query";

import {
  isOnboardingTourCompleted,
  isOnboardingTourSessionDismissed,
  markOnboardingTourCompleted,
  markOnboardingTourSessionDismissed,
} from "./onboarding-tour-storage";
import {
  ONBOARDING_TOUR_TARGETS,
  queryOnboardingTourTarget,
} from "./onboarding-tour-targets";

const OPEN_DELAY_MS = 300;
const HIGHLIGHT_RADIUS = 8;

const TourSpotlightStyle = createGlobalStyle<{
  $color: string;
  $radius: number;
}>`
  .ant-tour-target-placeholder {
    box-shadow: 0 0 0 2px ${({ $color }) => $color};
    border-radius: ${({ $radius }) => $radius}px;
  }
`;

export const AppOnboardingTour = observer(() => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const location = useLocation();
  const isMobile = useIsMobileViewport();
  const userStore = useUserStore();
  const userId = userStore.user?.id;

  const [open, setOpen] = useState(false);
  const finishedRef = useRef(false);

  const isHome = location.pathname === pagesMap.home;
  const canAutoStart =
    !isMobile &&
    isHome &&
    typeof userId === "number" &&
    !isOnboardingTourCompleted(userId) &&
    !isOnboardingTourSessionDismissed();

  useEffect(() => {
    if (!canAutoStart) {
      setOpen(false);
      return;
    }

    finishedRef.current = false;
    const timer = window.setTimeout(() => {
      setOpen(true);
    }, OPEN_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [canAutoStart]);

  const steps: TourProps["steps"] = useMemo(
    () => [
      {
        title: t("onboardingTour.steps.sider.title"),
        description: t("onboardingTour.steps.sider.description"),
        target: () => queryOnboardingTourTarget(ONBOARDING_TOUR_TARGETS.sider),
        placement: "right",
      },
      {
        title: t("onboardingTour.steps.create.title"),
        description: t("onboardingTour.steps.create.description"),
        target: () =>
          queryOnboardingTourTarget(ONBOARDING_TOUR_TARGETS.createButton),
        placement: "bottom",
      },
      {
        title: t("onboardingTour.steps.search.title"),
        description: t("onboardingTour.steps.search.description"),
        target: () => queryOnboardingTourTarget(ONBOARDING_TOUR_TARGETS.search),
        placement: "bottom",
      },
      {
        title: t("onboardingTour.steps.profile.title"),
        description: t("onboardingTour.steps.profile.description"),
        target: () =>
          queryOnboardingTourTarget(ONBOARDING_TOUR_TARGETS.profile),
        placement: "bottom",
      },
      {
        title: t("onboardingTour.steps.workStatus.title"),
        description: t("onboardingTour.steps.workStatus.description"),
        target: () =>
          queryOnboardingTourTarget(ONBOARDING_TOUR_TARGETS.workStatus),
        placement: "bottom",
      },
      {
        title: t("onboardingTour.steps.theme.title"),
        description: t("onboardingTour.steps.theme.description"),
        target: () => queryOnboardingTourTarget(ONBOARDING_TOUR_TARGETS.theme),
        placement: "bottomLeft",
      },
      {
        title: t("onboardingTour.steps.replay.title"),
        description: t("onboardingTour.steps.replay.description"),
        target: null,
      },
    ],
    [t],
  );

  const handleFinish = () => {
    finishedRef.current = true;
    if (typeof userId === "number") {
      markOnboardingTourCompleted(userId);
    }
    setOpen(false);
  };

  const handleClose = () => {
    if (!finishedRef.current) {
      markOnboardingTourSessionDismissed();
    }
    setOpen(false);
  };

  if (isMobile || typeof userId !== "number") {
    return null;
  }

  return (
    <>
      <TourSpotlightStyle $color={"white"} $radius={HIGHLIGHT_RADIUS} />
      <Tour
        open={open}
        onClose={handleClose}
        onFinish={handleFinish}
        steps={steps}
        disabledInteraction
        gap={{ offset: 6, radius: HIGHLIGHT_RADIUS }}
        styles={{
          section: {
            border: `1px solid ${token.colorBorder}`,
            maxWidth: 300,
          },
          title: {
            fontSize: 16,
            fontWeight: 600,
          },
          footer: {
            marginTop: 24,
          },
        }}
      />
    </>
  );
});
