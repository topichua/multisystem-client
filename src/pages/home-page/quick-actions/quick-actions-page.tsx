import { SquaresFourIcon } from "@phosphor-icons/react";
import { Flex, Typography } from "antd";
import type { KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { quickActionNavItems } from "@/app/router/navigation";
import { useThemeMode } from "@/theme/use-theme-mode";

import {
  CardIcon,
  CardsGrid,
  HeroIcon,
  PageContainer,
  PageHeader,
  QuickActionCard,
} from "./quick-actions-page.styled";

const { Title, Text, Paragraph } = Typography;

export const QuickActionsPage = () => {
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
  );
};
