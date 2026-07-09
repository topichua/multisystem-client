import {
  CaretRightIcon,
  FileTextIcon,
  FlowArrowIcon,
  GearSixIcon,
  GlobeIcon,
  UserCircleIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { settingsSectionNavItems } from "@/app/router/navigation";

import * as S from "./mobile-settings-hub-page.styled";

type SettingsMobileSectionKey = "workspace" | "account" | "preferences";
type SettingsMobileItemKey = (typeof settingsSectionNavItems)[number]["key"];

type SettingsMobilePresentation = {
  section: SettingsMobileSectionKey;
  icon: ReactNode;
  descriptionKey: string;
};

const settingsMobileSections = [
  {
    key: "workspace",
    titleKey: "settings.mobile.sections.workspace",
  },
  {
    key: "account",
    titleKey: "settings.mobile.sections.account",
  },
  {
    key: "preferences",
    titleKey: "settings.mobile.sections.preferences",
  },
] as const satisfies readonly {
  key: SettingsMobileSectionKey;
  titleKey: string;
}[];

const settingsMobilePresentationByKey = {
  "settings-groups": {
    section: "workspace",
    icon: <UsersThreeIcon />,
    descriptionKey: "settings.mobile.descriptions.groups",
  },
  "settings-templates": {
    section: "workspace",
    icon: <FileTextIcon />,
    descriptionKey: "settings.mobile.descriptions.templates",
  },
  "settings-statuses": {
    section: "workspace",
    icon: <FlowArrowIcon />,
    descriptionKey: "settings.mobile.descriptions.statuses",
  },
  "settings-user": {
    section: "account",
    icon: <UserCircleIcon />,
    descriptionKey: "settings.mobile.descriptions.user",
  },
  "settings-system": {
    section: "preferences",
    icon: <GearSixIcon />,
    descriptionKey: "settings.mobile.descriptions.system",
  },
  "settings-integrations": {
    section: "workspace",
    icon: <GlobeIcon />,
    descriptionKey: "settings.mobile.descriptions.integrations",
  },
} satisfies Record<SettingsMobileItemKey, SettingsMobilePresentation>;

export const MobileSettingsHubPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <S.Root>
      <S.Header>
        <S.PageTitle level={3}>{t("settings.title")}</S.PageTitle>
      </S.Header>

      <S.Sections>
        {settingsMobileSections.map((section) => {
          const sectionItems = settingsSectionNavItems.filter(
            (item) =>
              settingsMobilePresentationByKey[item.key].section === section.key,
          );

          return (
            <S.Section
              key={section.key}
              data-qa={`settings-mobile-hub-section-${section.key}`}
            >
              <S.SectionTitle>{t(section.titleKey)}</S.SectionTitle>
              <S.SectionCard>
                {sectionItems.map((item) => {
                  const presentation =
                    settingsMobilePresentationByKey[item.key];

                  return (
                    <S.ItemButton
                      key={item.key}
                      type="text"
                      block
                      data-qa={`settings-mobile-hub-item-${item.key}`}
                      onClick={() => navigate(item.path)}
                    >
                      <S.ItemContent align="center" gap={12}>
                        <S.IconTile aria-hidden="true">
                          {presentation.icon}
                        </S.IconTile>
                        <S.ItemCopy vertical gap={2}>
                          <S.ItemTitle>{t(item.labelKey)}</S.ItemTitle>
                          <S.ItemDescription>
                            {t(presentation.descriptionKey)}
                          </S.ItemDescription>
                        </S.ItemCopy>
                        <S.Caret aria-hidden="true">
                          <CaretRightIcon size={18} />
                        </S.Caret>
                      </S.ItemContent>
                    </S.ItemButton>
                  );
                })}
              </S.SectionCard>
            </S.Section>
          );
        })}
      </S.Sections>
    </S.Root>
  );
};
