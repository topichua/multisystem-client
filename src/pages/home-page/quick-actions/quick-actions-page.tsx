import { AppstoreOutlined } from "@ant-design/icons";
import { Flex, Typography } from "antd";
import type { KeyboardEvent, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { pagesMap } from "@/app/router/pages-map";
import { useThemeMode } from "@/theme/use-theme-mode";

import {
  ChatsCircleIcon,
  GearSixIcon,
  GlobeIcon,
  PackageIcon,
  ReceiptIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import {
  CardIcon,
  CardsGrid,
  HeroIcon,
  PageContainer,
  PageHeader,
  QuickActionCard,
} from "./quick-actions-page.styled";

const { Title, Text, Paragraph } = Typography;

type QuickAction = {
  key: string;
  titleKey: string;
  descriptionKey: string;
  path: string;
  icon: ReactNode;
  accent: string;
  accentBg: {
    light: string;
    dark: string;
  };
};

const quickActions: QuickAction[] = [
  {
    key: "chats",
    titleKey: "quickActions.cards.chats.title",
    descriptionKey: "quickActions.cards.chats.description",
    path: pagesMap.conversations,
    icon: <ChatsCircleIcon />,
    accent: "#722ed1",
    accentBg: {
      light: "#f3e8ff",
      dark: "rgba(114, 46, 209, 0.24)",
    },
  },
  {
    key: "products",
    titleKey: "quickActions.cards.products.title",
    descriptionKey: "quickActions.cards.products.description",
    path: pagesMap.products,
    icon: <PackageIcon />,
    accent: "#1677ff",
    accentBg: {
      light: "#e6f4ff",
      dark: "rgba(22, 119, 255, 0.24)",
    },
  },
  {
    key: "orders",
    titleKey: "quickActions.cards.orders.title",
    descriptionKey: "quickActions.cards.orders.description",
    path: pagesMap.orders,
    icon: <ReceiptIcon />,
    accent: "#fa541c",
    accentBg: {
      light: "#fff2e8",
      dark: "rgba(250, 84, 28, 0.24)",
    },
  },
  {
    key: "clients",
    titleKey: "quickActions.cards.clients.title",
    descriptionKey: "quickActions.cards.clients.description",
    path: pagesMap.clients,
    icon: <UsersThreeIcon />,
    accent: "#13a8a8",
    accentBg: {
      light: "#e6fffb",
      dark: "rgba(19, 168, 168, 0.24)",
    },
  },
  {
    key: "integrations",
    titleKey: "quickActions.cards.integrations.title",
    descriptionKey: "quickActions.cards.integrations.description",
    path: pagesMap.settingsIntegrations,
    icon: <GlobeIcon />,
    accent: "#60955d",
    accentBg: {
      light: "#edf8ed",
      dark: "rgba(96, 149, 93, 0.24)",
    },
  },
  {
    key: "settings",
    titleKey: "quickActions.cards.settings.title",
    descriptionKey: "quickActions.cards.settings.description",
    path: pagesMap.settings,
    icon: <GearSixIcon />,
    accent: "#eb2f96",
    accentBg: {
      light: "#fff0f6",
      dark: "rgba(235, 47, 150, 0.24)",
    },
  },
];

export const QuickActionsPage = () => {
  const { t } = useTranslation();
  const { mode } = useThemeMode();
  const navigate = useNavigate();

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
          <HeroIcon>
            <AppstoreOutlined />
          </HeroIcon>

          <Title level={2} style={{ margin: 0 }}>
            {t("quickActions.title")}
          </Title>

          <Text type="secondary">{t("quickActions.subtitle")}</Text>
        </PageHeader>

        <CardsGrid>
          {quickActions.map((action) => (
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
                    {t(action.titleKey)}
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
