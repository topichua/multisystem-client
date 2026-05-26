import { Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ChatsCircleIcon,
  GearSixIcon,
  PackageIcon,
  ReceiptIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import { useLocation, useNavigate } from "react-router";

import { UserProfile } from "@/components/user-profile/user-profile";
import { pagesMap } from "@/app/router/pages-map";

import * as S from "./sider.styled";

type SiderNavItem = {
  path: string;
  icon: React.ReactNode;
  label: string;
  isActive?: (pathname: string) => boolean;
};

const { Text } = Typography;

type MenuSiderMainProps = {
  showLabel: boolean;
  onOpenDrawer: () => void;
  onCloseDrawer: () => void;
};

const MenuSiderMain = observer(
  ({ showLabel, onOpenDrawer, onCloseDrawer }: MenuSiderMainProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const siderNavItems: SiderNavItem[] = useMemo(
      () => [
        {
          path: pagesMap.conversations,
          icon: <ChatsCircleIcon size={24} />,
          label: t("nav.chats"),
          isActive: (pathname) => pathname.startsWith(pagesMap.conversations),
        },
        {
          path: pagesMap.products,
          icon: <PackageIcon size={24} />,
          label: t("nav.products"),
          isActive: (pathname) => pathname.startsWith(pagesMap.products),
        },
        {
          path: pagesMap.orders,
          icon: <ReceiptIcon size={24} />,
          label: t("nav.orders"),
          isActive: (pathname) => pathname.startsWith(pagesMap.orders),
        },
        {
          path: pagesMap.clients,
          icon: <UsersThreeIcon size={24} />,
          label: t("nav.clients"),
          isActive: (pathname) => pathname.startsWith(pagesMap.clients),
        },
        {
          path: pagesMap.settings,
          icon: <GearSixIcon size={24} />,
          label: t("nav.settings"),
          isActive: (pathname) => pathname.startsWith(pagesMap.settings),
        },
      ],
      [t],
    );

    const renderNavButton = (item: SiderNavItem) => {
      const isActive =
        item.isActive?.(location.pathname) ?? location.pathname === item.path;
      const label = item.label;
      const qaKey = item.path.replace(/\//g, "_").replace(/^_/, "") || "root";

      return (
        <S.Button
          key={item.path}
          icon={item.icon}
          className={isActive ? "active" : ""}
          onClick={() => {
            navigate(item.path);
            onCloseDrawer();
          }}
          onMouseEnter={onOpenDrawer}
          block
          style={
            showLabel
              ? { display: "flex", justifyContent: "flex-start" }
              : undefined
          }
          data-qa={
            showLabel ? `fullWidth_menu_sider_${qaKey}` : `menu_sider_${qaKey}`
          }
          $showLabel={showLabel}
        >
          {showLabel ? (
            <Text className="common-button-text">{label}</Text>
          ) : undefined}
        </S.Button>
      );
    };

    return (
      <S.MenuSider $showLabel={showLabel}>
        {siderNavItems.map(renderNavButton)}
      </S.MenuSider>
    );
  },
);

export const Sider = observer(() => {
  const { t } = useTranslation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const goHome = () => {
    navigate(pagesMap.home);
    setIsDrawerOpen(false);
  };

  return (
    <S.Wrapper>
      <S.MenuSiderPanel
        $isDrawerOpen={isDrawerOpen}
        onMouseEnter={() => setIsDrawerOpen(true)}
        onMouseLeave={() => setIsDrawerOpen(false)}
      >
        <S.SiderScrollArea>
          <S.Brand
            $showLabel={isDrawerOpen}
            role="button"
            tabIndex={0}
            aria-label={t("nav.homeAria")}
            onClick={goHome}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                goHome();
              }
            }}
          >
            <S.BrandLogo
              src="/logos/only_icon_logo.svg"
              alt={`${t("brand")} icon`}
            />
            {isDrawerOpen && <S.BrandLogoText>{t("brand")}</S.BrandLogoText>}
          </S.Brand>
          <MenuSiderMain
            showLabel={isDrawerOpen}
            onOpenDrawer={() => setIsDrawerOpen(true)}
            onCloseDrawer={() => setIsDrawerOpen(false)}
          />
        </S.SiderScrollArea>
        <S.SiderFooter>
          <UserProfile />
        </S.SiderFooter>
      </S.MenuSiderPanel>
    </S.Wrapper>
  );
});
