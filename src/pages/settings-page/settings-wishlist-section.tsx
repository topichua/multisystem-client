import { HeartIcon } from "@phosphor-icons/react";
import { Flex, Spin, Switch, Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { useWorkspaceSettingsStore } from "@/features/workspace-settings/model/use-workspace-settings-store";
import { useNotification } from "@/shared/components/notification/use-notification";

import { SettingsPreferenceRow } from "./components/settings-preference-row";
import { SettingsSectionHeader } from "./components/settings-section-header";
import * as MobileS from "./mobile-settings-page.styled";

const { Text } = Typography;

type SettingsWishlistSectionProps = {
  layout?: "desktop" | "mobile";
};

export const SettingsWishlistSection = observer(
  ({ layout = "desktop" }: SettingsWishlistSectionProps) => {
    const { t } = useTranslation();
    const workspaceSettingsStore = useWorkspaceSettingsStore();
    const notification = useNotification();
    const isMobile = layout === "mobile";

    useEffect(() => {
      if (
        !workspaceSettingsStore.initialized &&
        !workspaceSettingsStore.loadLoading
      ) {
        void workspaceSettingsStore.loadSettings();
      }
    }, [workspaceSettingsStore]);

    const handleWishlistEnabledChange = useCallback(
      async (wishlistEnabled: boolean) => {
        try {
          await workspaceSettingsStore.updateWishlistEnabled(wishlistEnabled);
        } catch (e) {
          notification.error({
            title: getApiErrorMessage(e, t("system.wishlist.saveError")),
          });
        }
      },
      [notification, t, workspaceSettingsStore],
    );

    const isSettingsReady =
      workspaceSettingsStore.wishlistEnabled != null &&
      workspaceSettingsStore.currency != null;
    const isLoading =
      workspaceSettingsStore.loadLoading &&
      workspaceSettingsStore.wishlistEnabled == null;
    const isDisabled =
      workspaceSettingsStore.loadLoading ||
      workspaceSettingsStore.wishlistEnabledSaveLoading ||
      !isSettingsReady;

    const wishlistControl = (
      <Flex justify={isMobile ? "flex-start" : "flex-end"}>
        <Switch
          checked={workspaceSettingsStore.wishlistEnabled ?? false}
          loading={workspaceSettingsStore.wishlistEnabledSaveLoading}
          disabled={isDisabled}
          data-qa="settings-wishlist-enabled-switch"
          onChange={(checked) => {
            void handleWishlistEnabledChange(checked);
          }}
        />
      </Flex>
    );

    const wishlistRow = (
      <SettingsPreferenceRow
        icon={<HeartIcon size={20} weight="fill" />}
        title={t("system.wishlist.rowTitle")}
        description={t("system.wishlist.rowDescription")}
        control={wishlistControl}
        stackControl={isMobile}
      />
    );

    if (isMobile) {
      return (
        <Spin spinning={isLoading}>
          <MobileS.SectionGroup>
            <MobileS.SectionTitle>
              {t("system.wishlist.title")}
            </MobileS.SectionTitle>
            <MobileS.PreferenceBlock>
              <Text type="secondary">{t("system.wishlist.description")}</Text>
              {wishlistRow}
            </MobileS.PreferenceBlock>
          </MobileS.SectionGroup>
        </Spin>
      );
    }

    return (
      <Spin spinning={isLoading}>
        <SettingsSectionHeader
          title={t("system.wishlist.title")}
          description={t("system.wishlist.description")}
        />
        {wishlistRow}
      </Spin>
    );
  },
);
