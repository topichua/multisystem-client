import { SquaresFourIcon } from "@phosphor-icons/react";
import { Typography } from "antd";
import type { CSSProperties, KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import {
  quickActionNavItems,
  type QuickActionNavItem,
} from "@/app/router/navigation";
import { useThemeMode } from "@/theme/use-theme-mode";

import {
  CardIcon,
  CardsGrid,
  DesktopContent,
  DesktopQuickActionsViewport,
  HeroIcon,
  MobileHeader,
  MobileNavCard,
  MobileNavGrid,
  MobileNavIcon,
  MobileNavLabel,
  MobileSubtitle,
  MobileTitle,
  MobileTitleBlock,
  MobileWorkspace,
  PageContainer,
  PageHeader,
  QuickActionCard,
} from "./quick-actions-page.styled";

const { Title, Text, Paragraph } = Typography;

type MobileCardStyle = CSSProperties & {
  "--card-accent": string;
  "--card-accent-bg": string;
  "--card-surface-tint": string;
};

const getCardAccentBg = (action: QuickActionNavItem, mode: "dark" | "light") =>
  mode === "dark" ? action.accentBg.dark : action.accentBg.light;

const getMobileCardStyle = (
  action: QuickActionNavItem,
  mode: "dark" | "light",
): MobileCardStyle => ({
  "--card-accent": action.accent,
  "--card-accent-bg": getCardAccentBg(action, mode),
  "--card-surface-tint":
    mode === "dark" ? action.surfaceTint.dark : action.surfaceTint.light,
});

const DesktopQuickActions = () => {
  const { t } = useTranslation();
  const { mode } = useThemeMode();
  const navigate = useNavigate();
  const [heroAccent] = quickActionNavItems;

  const handleCardKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    path: string,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      navigate(path);
    }
  };

  if (!heroAccent) {
    return null;
  }

  return (
    <DesktopQuickActionsViewport>
      <PageContainer>
        <DesktopContent>
          <PageHeader>
            <HeroIcon
              $accent={heroAccent.accent}
              $accentBg={getCardAccentBg(heroAccent, mode)}
            >
              <SquaresFourIcon weight="duotone" />
            </HeroIcon>

            <Title level={2} style={{ margin: 0 }}>
              {t("quickActions.title")}
            </Title>

            <Text type="secondary">{t("quickActions.subtitle")}</Text>
          </PageHeader>

          <CardsGrid>
            {quickActionNavItems.map((action) => (
              <QuickActionCard
                key={action.key}
                hoverable
                variant="borderless"
                role="button"
                tabIndex={0}
                $accent={action.accent}
                $accentBg={getCardAccentBg(action, mode)}
                onClick={() => navigate(action.path)}
                onKeyDown={(event) => handleCardKeyDown(event, action.path)}
              >
                <CardIcon
                  $accent={action.accent}
                  $accentBg={getCardAccentBg(action, mode)}
                >
                  {action.icon}
                </CardIcon>

                <Title level={4} style={{ margin: 0 }}>
                  {t(action.labelKey)}
                </Title>

                <Paragraph
                  type="secondary"
                  style={{ margin: 0, textAlign: "center" }}
                >
                  {t(action.descriptionKey)}
                </Paragraph>
              </QuickActionCard>
            ))}
          </CardsGrid>
        </DesktopContent>
      </PageContainer>
    </DesktopQuickActionsViewport>
  );
};

const MobileWorkspaceQuickActions = () => {
  const { t } = useTranslation();
  const { mode } = useThemeMode();
  const navigate = useNavigate();

  return (
    <MobileWorkspace>
      <MobileHeader>
        <MobileTitleBlock>
          <MobileTitle>{t("quickActions.title")}</MobileTitle>
          <MobileSubtitle>{t("quickActions.subtitle")}</MobileSubtitle>
        </MobileTitleBlock>
      </MobileHeader>

      <MobileNavGrid>
        {quickActionNavItems.map((item) => (
          <MobileNavCard
            key={item.key}
            type="button"
            style={getMobileCardStyle(item, mode)}
            aria-label={t(item.labelKey)}
            data-qa={`mobile-workspace-nav-${item.key}`}
            onClick={() => navigate(item.path)}
          >
            <MobileNavIcon>{item.icon}</MobileNavIcon>
            <MobileNavLabel>{t(item.labelKey)}</MobileNavLabel>
          </MobileNavCard>
        ))}
      </MobileNavGrid>
    </MobileWorkspace>
  );
};

export const QuickActionsPage = () => {
  return (
    <>
      <DesktopQuickActions />
      <MobileWorkspaceQuickActions />
    </>
  );
};
