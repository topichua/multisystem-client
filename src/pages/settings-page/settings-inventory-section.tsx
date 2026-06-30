import { CubeIcon, InfinityIcon, SquaresFourIcon } from "@phosphor-icons/react";
import { Spin, Typography } from "antd";
import type { KeyboardEvent, ReactNode } from "react";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { InventoryMode } from "@/features/workspace-settings/model/workspace-settings.types";
import { useWorkspaceSettingsStore } from "@/features/workspace-settings/model/use-workspace-settings-store";
import { useNotification } from "@/shared/components/notification/use-notification";

import * as S from "./settings-inventory-section.styled";
import * as MobileS from "./mobile-settings-page.styled";

const { Text } = Typography;

type InventoryModeOption = {
  value: InventoryMode;
  titleKey: string;
  descriptionKey: string;
  icon: ReactNode;
};

const INVENTORY_MODE_OPTIONS: InventoryModeOption[] = [
  {
    value: InventoryMode.off,
    titleKey: "system.inventory.offTitle",
    descriptionKey: "system.inventory.offDescription",
    icon: <InfinityIcon size={20} />,
  },
  {
    value: InventoryMode.simple,
    titleKey: "system.inventory.simpleTitle",
    descriptionKey: "system.inventory.simpleDescription",
    icon: <SquaresFourIcon size={20} />,
  },
  {
    value: InventoryMode.advanced,
    titleKey: "system.inventory.advancedTitle",
    descriptionKey: "system.inventory.advancedDescription",
    icon: <CubeIcon size={20} />,
  },
];

type SettingsInventorySectionProps = {
  layout?: "desktop" | "mobile";
};

export const SettingsInventorySection = observer(
  ({ layout = "desktop" }: SettingsInventorySectionProps) => {
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

    const handleInventoryModeChange = useCallback(
      async (inventoryMode: InventoryMode) => {
        try {
          await workspaceSettingsStore.updateInventoryMode(inventoryMode);
        } catch (e) {
          notification.error({
            title: getApiErrorMessage(e, t("system.inventory.saveError")),
          });
        }
      },
      [notification, t, workspaceSettingsStore],
    );

    const handleOptionKeyDown = useCallback(
      (event: KeyboardEvent<HTMLDivElement>, inventoryMode: InventoryMode) => {
        if (event.key !== "Enter" && event.key !== " ") {
          return;
        }

        event.preventDefault();
        void handleInventoryModeChange(inventoryMode);
      },
      [handleInventoryModeChange],
    );

    const selectedMode = workspaceSettingsStore.inventoryMode;
    const isSettingsReady =
      selectedMode != null && workspaceSettingsStore.currency != null;
    const isLoading =
      workspaceSettingsStore.loadLoading && selectedMode == null;
    const isDisabled =
      workspaceSettingsStore.loadLoading ||
      workspaceSettingsStore.inventoryModeSaveLoading ||
      !isSettingsReady;

    const options = (
      <S.OptionsRadioGroup
        value={selectedMode ?? undefined}
        disabled={isDisabled}
        onChange={(event) => {
          void handleInventoryModeChange(event.target.value as InventoryMode);
        }}
      >
        <S.OptionsList>
          {INVENTORY_MODE_OPTIONS.map((option) => {
            const isSelected = selectedMode === option.value;
            const optionDisabled = isDisabled;

            return (
              <S.OptionRow
                key={option.value}
                $disabled={optionDisabled}
                $selected={isSelected}
                role="radio"
                aria-checked={isSelected}
                aria-disabled={optionDisabled}
                tabIndex={optionDisabled ? -1 : 0}
                onClick={() => {
                  if (!optionDisabled) {
                    void handleInventoryModeChange(option.value);
                  }
                }}
                onKeyDown={(event) => handleOptionKeyDown(event, option.value)}
              >
                <S.OptionContent>
                  <S.OptionRadio value={option.value} />

                  <S.OptionIcon $selected={isSelected}>
                    {option.icon}
                  </S.OptionIcon>

                  <S.OptionCopy>
                    <Text strong>{t(option.titleKey)}</Text>
                    <Text type="secondary">{t(option.descriptionKey)}</Text>
                  </S.OptionCopy>
                </S.OptionContent>
              </S.OptionRow>
            );
          })}
        </S.OptionsList>
      </S.OptionsRadioGroup>
    );

    if (isMobile) {
      return (
        <Spin spinning={isLoading}>
          <MobileS.SectionGroup>
            <MobileS.SectionTitle>
              {t("system.inventory.title")}
            </MobileS.SectionTitle>
            <MobileS.PreferenceBlock>
              <Text type="secondary">{t("system.inventory.description")}</Text>
              {options}
            </MobileS.PreferenceBlock>
          </MobileS.SectionGroup>
        </Spin>
      );
    }

    return (
      <Spin spinning={isLoading}>
        <S.DesktopContent>
          <S.DesktopHeader>
            <S.DesktopTitle level={5}>
              {t("system.inventory.title")}
            </S.DesktopTitle>
            <Text type="secondary">{t("system.inventory.description")}</Text>
          </S.DesktopHeader>

          {options}
        </S.DesktopContent>
      </Spin>
    );
  },
);
