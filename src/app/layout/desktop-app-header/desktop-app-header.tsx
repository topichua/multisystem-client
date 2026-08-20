import {
  CaretDownIcon,
  CaretUpIcon,
  CheckIcon,
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
import { Button, Dropdown, Tooltip, Typography } from "antd";
import type { MenuProps } from "antd";
import { observer } from "mobx-react-lite";
import { startTransition, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { useTheme } from "styled-components";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { getClientsCreatePath, pagesMap } from "@/app/router/pages-map";
import { UserAvatar } from "@/components/user-avatar";
import type { MemberWorkStatus } from "@/features/auth/model/auth-session.types";
import { useAuth } from "@/features/auth/model/use-auth";
import { useUserStore } from "@/features/auth/model/use-user-store";
import { StockSupplyModal } from "@/features/inventory/components/stock-supply-modal/stock-supply-modal";
import { MemberWorkStatusLabel } from "@/shared/components/member-work-status/member-work-status-label";
import { MemberWorkStatusDot } from "@/shared/components/member-work-status/member-work-status.styled";
import { getMemberWorkStatusColors } from "@/shared/components/member-work-status/member-work-status";
import { useNotification } from "@/shared/components/notification/use-notification";
import { useThemeMode } from "@/theme/use-theme-mode";

import * as S from "./desktop-app-header.styled";

const WORK_STATUS_OPTIONS: readonly MemberWorkStatus[] = [
  "accepting_new_chats",
  "not_accepting_new_chats",
  "break",
];

export const DesktopAppHeader = observer(() => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const notification = useNotification();
  const { logout } = useAuth();
  const userStore = useUserStore();
  const { mode, preference, setPreference } = useThemeMode();
  const isAutoTheme = preference === "system";
  const displayName = userStore.displayName ?? t("profile.user");
  const avatarSrc = userStore.user?.avatar_src ?? undefined;
  const workStatus = userStore.workStatus;
  const [stockSupplyModalOpen, setStockSupplyModalOpen] = useState(false);
  const [workStatusOpen, setWorkStatusOpen] = useState(false);
  const workStatusColors = getMemberWorkStatusColors(theme);

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

  const workStatusMenuItems: MenuProps["items"] = [
    {
      key: "work-status",
      type: "group",
      label: (
        <Typography.Text
          type="secondary"
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 0.3,
            textTransform: "uppercase",
          }}
        >
          {t("appHeader.workStatus.title")}
        </Typography.Text>
      ),
      children: WORK_STATUS_OPTIONS.map((status) => {
        const selected = status === workStatus;

        return {
          key: status,
          disabled: userStore.workStatusUpdating,
          label: (
            <S.StatusMenuItem>
              <S.StatusMenuItemContent>
                <MemberWorkStatusDot $color={workStatusColors[status]} />
                <S.StatusMenuItemLabel $selected={selected}>
                  {t(`appHeader.workStatus.${status}.menu`)}
                </S.StatusMenuItemLabel>
              </S.StatusMenuItemContent>
              {selected ? (
                <S.StatusMenuCheck>
                  <CheckIcon size={14} weight="bold" />
                </S.StatusMenuCheck>
              ) : null}
            </S.StatusMenuItem>
          ),
        };
      }),
    },
  ];

  const handleWorkStatusClick: NonNullable<MenuProps["onClick"]> = ({
    key,
  }) => {
    startTransition(() => {
      void userStore
        .updateWorkStatus(key as MemberWorkStatus)
        .catch((error) => {
          notification.error({
            title: getApiErrorMessage(
              error,
              t("appHeader.workStatus.updateError"),
            ),
          });
        });
    });
  };

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
        <Button
          icon={<PlusIcon size={16} />}
          data-qa="layout-desktop-create-button"
        >
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
          disabled
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

        <S.StatusButtonWrapper>
          <Dropdown
            trigger={["click"]}
            placement="bottomRight"
            open={workStatusOpen}
            onOpenChange={setWorkStatusOpen}
            menu={{
              items: workStatusMenuItems,
              onClick: handleWorkStatusClick,
            }}
          >
            <S.StyledStatusButton
              aria-expanded={workStatusOpen}
              aria-label={t("appHeader.workStatus.aria")}
              data-qa="layout-desktop-work-status"
            >
              <MemberWorkStatusLabel status={workStatus} />
              {workStatusOpen ? <CaretUpIcon /> : <CaretDownIcon />}
            </S.StyledStatusButton>
          </Dropdown>
        </S.StatusButtonWrapper>

        <S.CustomDivider />

        <Tooltip
          placement="bottom"
          title={
            isAutoTheme
              ? t("sidebar.themeAutoSwitchDisabledTooltip")
              : undefined
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
