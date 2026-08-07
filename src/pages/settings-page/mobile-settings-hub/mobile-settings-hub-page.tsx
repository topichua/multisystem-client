import {
  CaretRightIcon,
  CreditCardIcon,
  FileTextIcon,
  FlowArrowIcon,
  GearSixIcon,
  GlobeIcon,
  LightningIcon,
  UserCircleIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { settingsSectionNavGroups } from "@/app/router/navigation";

import * as S from "./mobile-settings-hub-page.styled";

type SettingsMobileItemKey =
  (typeof settingsSectionNavGroups)[number]["items"][number]["key"];

const settingsMobilePresentationByKey = {
  "settings-user": {
    icon: <UserCircleIcon />,
    descriptionKey: "settings.mobile.descriptions.user",
  },
  "settings-system": {
    icon: <GearSixIcon />,
    descriptionKey: "settings.mobile.descriptions.system",
  },
  "settings-groups": {
    icon: <UsersThreeIcon />,
    descriptionKey: "settings.mobile.descriptions.groups",
  },
  "settings-statuses": {
    icon: <FlowArrowIcon />,
    descriptionKey: "settings.mobile.descriptions.statuses",
  },
  "settings-automation": {
    icon: <LightningIcon />,
    descriptionKey: "settings.mobile.descriptions.automation",
  },
  "settings-templates": {
    icon: <FileTextIcon />,
    descriptionKey: "settings.mobile.descriptions.templates",
  },
  "settings-integrations": {
    icon: <GlobeIcon />,
    descriptionKey: "settings.mobile.descriptions.integrations",
  },
  "settings-billing": {
    icon: <CreditCardIcon />,
    descriptionKey: "settings.mobile.descriptions.billing",
  },
} satisfies Record<
  SettingsMobileItemKey,
  {
    icon: ReactNode;
    descriptionKey: string;
  }
>;

export const MobileSettingsHubPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <S.Root>
      <S.Header>
        <S.PageTitle level={3}>{t("settings.title")}</S.PageTitle>
      </S.Header>

      <S.Sections>
        {settingsSectionNavGroups.map((section) => (
          <S.Section
            key={section.key}
            data-qa={`settings-mobile-hub-section-${section.key}`}
          >
            <S.SectionTitle>{t(section.titleKey)}</S.SectionTitle>
            <S.SectionCard>
              {section.items.map((item) => {
                const presentation = settingsMobilePresentationByKey[item.key];

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
        ))}
      </S.Sections>
    </S.Root>
  );
};
