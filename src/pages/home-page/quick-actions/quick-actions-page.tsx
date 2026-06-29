import { SquaresFourIcon } from "@phosphor-icons/react";
import { Flex, Typography } from "antd";
import type { CSSProperties, KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import {
  mobileNavSections,
  quickActionNavItems,
  type MobileNavItem,
} from "@/app/router/navigation";
import * as darkColors from "@/styled/definitions/colors.dark";
import { base, brandPalette } from "@/styled/definitions/colors";
import { useThemeMode } from "@/theme/use-theme-mode";

import {
  CardIcon,
  CardsGrid,
  DesktopQuickActionsViewport,
  HeroIcon,
  MobileHeader,
  MobileNavCard,
  MobileNavGrid,
  MobileNavIcon,
  MobileNavLabel,
  MobileSection,
  MobileSectionTitle,
  MobileSections,
  MobileSubtitle,
  MobileTitle,
  MobileTitleBlock,
  MobileWorkspace,
  PageContainer,
  PageHeader,
  QuickActionCard,
} from "./quick-actions-page.styled";

const { Title, Text, Paragraph } = Typography;

type MobileNavSectionConfig = (typeof mobileNavSections)[number];
type MobileWorkspaceSectionKey = Exclude<
  MobileNavSectionConfig["key"],
  "workspace"
>;
type MobileWorkspaceNavItemKey = Exclude<MobileNavItem["key"], "home">;
type MobileWorkspaceSectionConfig = Extract<
  MobileNavSectionConfig,
  { key: MobileWorkspaceSectionKey }
>;
type MobileWorkspaceSection = Omit<MobileWorkspaceSectionConfig, "titleKey"> & {
  key: MobileWorkspaceSectionKey;
  titleKey: string;
};

type MobileWorkspacePresentation = {
  accent: string;
  accentBg: {
    light: string;
    dark: string;
  };
  surfaceTint: {
    light: string;
    dark: string;
  };
};

type MobileCardStyle = CSSProperties & {
  "--card-accent": string;
  "--card-accent-bg": string;
  "--card-surface-tint": string;
};

const mobileWorkspacePresentationByKey: Record<
  MobileWorkspaceNavItemKey,
  MobileWorkspacePresentation
> = {
  chats: {
    accent: base.violet[7],
    accentBg: {
      light: base.violet[2],
      dark: darkColors.functional.background.promotion,
    },
    surfaceTint: {
      light: base.violet[1],
      dark: darkColors.functional.background.promotion,
    },
  },
  instagram: {
    accent: base.pink[6],
    accentBg: {
      light: base.pink[2],
      dark: darkColors.base.pink[9],
    },
    surfaceTint: {
      light: base.pink[1],
      dark: darkColors.base.pink[10],
    },
  },
  products: {
    accent: brandPalette[7],
    accentBg: {
      light: brandPalette[2],
      dark: darkColors.functional.background.active,
    },
    surfaceTint: {
      light: brandPalette[1],
      dark: darkColors.functional.background.active,
    },
  },
  orders: {
    accent: base.volcano[6],
    accentBg: {
      light: base.volcano[2],
      dark: darkColors.base.volcano[9],
    },
    surfaceTint: {
      light: base.volcano[1],
      dark: darkColors.base.volcano[10],
    },
  },
  analytics: {
    accent: base.blue[6],
    accentBg: {
      light: base.blue[2],
      dark: darkColors.base.blue[9],
    },
    surfaceTint: {
      light: base.blue[1],
      dark: darkColors.base.blue[10],
    },
  },
  clients: {
    accent: base.cyan[6],
    accentBg: {
      light: base.cyan[2],
      dark: darkColors.base.cyan[9],
    },
    surfaceTint: {
      light: base.cyan[1],
      dark: darkColors.base.cyan[10],
    },
  },
  team: {
    accent: base.magenta[6],
    accentBg: {
      light: base.magenta[2],
      dark: darkColors.base.magenta[9],
    },
    surfaceTint: {
      light: base.magenta[1],
      dark: darkColors.base.magenta[10],
    },
  },
  integrations: {
    accent: base.green[6],
    accentBg: {
      light: base.green[2],
      dark: darkColors.functional.background.success,
    },
    surfaceTint: {
      light: base.green[1],
      dark: darkColors.functional.background.success,
    },
  },
  settings: {
    accent: base.pink[6],
    accentBg: {
      light: base.pink[2],
      dark: darkColors.base.pink[9],
    },
    surfaceTint: {
      light: base.pink[1],
      dark: darkColors.base.pink[10],
    },
  },
};

const quickActionsMobileTitleBySectionKey = {
  "daily-work": "quickActions.mobileSections.dailyWork",
  "customers-workspace": "quickActions.mobileSections.customersWorkspace",
} satisfies Record<MobileWorkspaceSectionKey, string>;

const isMobileWorkspaceSection = (
  section: MobileNavSectionConfig,
): section is MobileWorkspaceSectionConfig =>
  section.key === "daily-work" || section.key === "customers-workspace";

const mobileWorkspaceSections: readonly MobileWorkspaceSection[] =
  mobileNavSections.filter(isMobileWorkspaceSection).map((section) => ({
    ...section,
    titleKey: quickActionsMobileTitleBySectionKey[section.key],
  }));

const getMobileCardStyle = (
  itemKey: MobileNavItem["key"],
  mode: "dark" | "light",
): MobileCardStyle => {
  if (itemKey === "home") {
    throw new Error("Home item is not rendered in quick actions mobile cards");
  }

  const presentation = mobileWorkspacePresentationByKey[itemKey];

  return {
    "--card-accent": presentation.accent,
    "--card-accent-bg": presentation.accentBg[mode],
    "--card-surface-tint": presentation.surfaceTint[mode],
  };
};

const DesktopQuickActions = () => {
  const { t } = useTranslation();
  const { mode } = useThemeMode();
  const navigate = useNavigate();
  const heroAccent = quickActionNavItems[0];
  const heroAccentBg =
    mode === "dark" ? heroAccent.accentBg.dark : heroAccent.accentBg.light;

  const handleCardKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    path: string,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      navigate(path);
    }
  };

  return (
    <DesktopQuickActionsViewport>
      <PageContainer>
        <Flex vertical align="center" gap={36}>
          <PageHeader>
            <HeroIcon $accent={heroAccent.accent} $accentBg={heroAccentBg}>
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
                $accentBg={
                  mode === "dark" ? action.accentBg.dark : action.accentBg.light
                }
                onClick={() => navigate(action.path)}
                onKeyDown={(event) => handleCardKeyDown(event, action.path)}
              >
                <Flex align="center" vertical gap={20}>
                  <CardIcon
                    $accent={action.accent}
                    $accentBg={
                      mode === "dark"
                        ? action.accentBg.dark
                        : action.accentBg.light
                    }
                  >
                    {action.icon}
                  </CardIcon>

                  <Flex align="center" vertical gap={8}>
                    <Title level={4} style={{ margin: 0 }}>
                      {t(action.labelKey)}
                    </Title>

                    <Paragraph
                      type="secondary"
                      style={{ margin: 0, textAlign: "center" }}
                    >
                      {t(action.descriptionKey)}
                    </Paragraph>
                  </Flex>
                </Flex>
              </QuickActionCard>
            ))}
          </CardsGrid>
        </Flex>
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

      <MobileSections>
        {mobileWorkspaceSections.map((section) => (
          <MobileSection key={section.key}>
            <MobileSectionTitle>{t(section.titleKey)}</MobileSectionTitle>

            <MobileNavGrid>
              {section.items.map((item) => (
                <MobileNavCard
                  key={item.key}
                  type="button"
                  $fullWidth={item.key === "settings"}
                  style={getMobileCardStyle(item.key, mode)}
                  aria-label={t(item.labelKey)}
                  data-qa={`mobile-workspace-nav-${item.key}`}
                  onClick={() => navigate(item.path)}
                >
                  <MobileNavIcon>{item.icon}</MobileNavIcon>
                  <MobileNavLabel>{t(item.labelKey)}</MobileNavLabel>
                </MobileNavCard>
              ))}
            </MobileNavGrid>
          </MobileSection>
        ))}
      </MobileSections>
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
