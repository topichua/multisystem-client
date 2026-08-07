import {
  CaretDownIcon,
  CubeIcon,
  MagnifyingGlassIcon,
  MoonIcon,
  PlusIcon,
  SignOutIcon,
  SunIcon,
  TagIcon,
  TruckIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import { Button, Dropdown, Tooltip } from "antd";
import type { MenuProps } from "antd";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { getClientsCreatePath, pagesMap } from "@/app/router/pages-map";
import { UserAvatar } from "@/components/user-avatar";
import { useAuth } from "@/features/auth/model/use-auth";
import { useUserStore } from "@/features/auth/model/use-user-store";
import { StockSupplyModal } from "@/features/inventory/components/stock-supply-modal/stock-supply-modal";
import { useThemeMode } from "@/theme/use-theme-mode";

import * as S from "./desktop-app-header.styled";

export const DesktopAppHeader = observer(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const userStore = useUserStore();
  const { mode, preference, setPreference } = useThemeMode();
  const isAutoTheme = preference === "system";
  const displayName = userStore.displayName ?? t("profile.user");
  const avatarSrc = userStore.user?.avatar_src ?? undefined;
  const [stockSupplyModalOpen, setStockSupplyModalOpen] = useState(false);

  const handleThemeToggle = () => {
    if (isAutoTheme) {
      return;
    }

    setPreference(mode === "dark" ? "light" : "dark");
  };

  const handleCreateMenuClick: NonNullable<MenuProps["onClick"]> = ({
    key,
  }) => {
    switch (key) {
      case "product":
        navigate(pagesMap.productsListAdd);
        return;
      case "order":
        navigate(pagesMap.ordersNew);
        return;
      case "client":
        navigate(getClientsCreatePath());
        return;
      case "supply":
        setStockSupplyModalOpen(true);
        return;
      default:
        return;
    }
  };

  const createMenuItems: MenuProps["items"] = [
    {
      key: "product",
      label: t("appHeader.createProduct"),
      icon: <CubeIcon size={16} />,
    },
    {
      key: "order",
      label: t("appHeader.createOrder"),
      icon: <TagIcon size={16} />,
    },
    {
      key: "client",
      label: t("appHeader.createClient"),
      icon: <UsersThreeIcon size={16} />,
    },
    {
      key: "supply",
      label: t("appHeader.createSupply"),
      icon: <TruckIcon size={16} />,
    },
  ];

  return (
    <S.Header>
      <S.BrandButton
        type="text"
        aria-label={t("nav.returnWorkspaceHomeAria")}
        onClick={() => navigate(pagesMap.home)}
      >
        <S.BrandLogo src="/logos/logo.png" alt="" aria-hidden="true" />
      </S.BrandButton>

      <Dropdown
        trigger={["click"]}
        menu={{
          items: createMenuItems,
          onClick: handleCreateMenuClick,
        }}
      >
        <Button icon={<PlusIcon size={16} />}>
          {t("appHeader.create")}
          <CaretDownIcon size={12} />
        </Button>
      </Dropdown>

      <S.SearchField data-qa="layout-desktop-search">
        <S.SearchInput
          allowClear
          prefix={<MagnifyingGlassIcon size={16} />}
          aria-label={t("appHeader.searchAria")}
          placeholder={t("appHeader.searchPlaceholder")}
        />
      </S.SearchField>

      <S.Actions>
        <S.ProfileButton
          type="text"
          data-qa="layout-desktop-profile-link"
          onClick={() => navigate(pagesMap.settingsUser)}
        >
          <S.ProfileAvatarSlot>
            <UserAvatar name={displayName} size={28} src={avatarSrc} />
          </S.ProfileAvatarSlot>
          <S.ProfileName>{displayName}</S.ProfileName>
        </S.ProfileButton>

        <Tooltip
          placement="bottom"
          title={
            isAutoTheme
              ? t("sidebar.themeAutoSwitchDisabledTooltip")
              : t("appHeader.toggleTheme")
          }
        >
          <span>
            <S.IconButton
              type="text"
              disabled={isAutoTheme}
              aria-label={t("appHeader.toggleTheme")}
              data-qa="layout-desktop-theme-toggle"
              icon={
                mode === "dark" ? <SunIcon size={18} /> : <MoonIcon size={18} />
              }
              onClick={handleThemeToggle}
            />
          </span>
        </Tooltip>

        <S.IconButton
          type="text"
          aria-label={t("profile.logOut")}
          data-qa="layout-desktop-logout"
          icon={<SignOutIcon size={18} />}
          onClick={logout}
        />
      </S.Actions>

      <StockSupplyModal
        open={stockSupplyModalOpen}
        onClose={() => setStockSupplyModalOpen(false)}
      />
    </S.Header>
  );
});
