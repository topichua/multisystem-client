import {
  CaretRightIcon,
  ShieldCheckIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { teamSectionNavItems } from "@/app/router/navigation";

import * as S from "./mobile-team-hub-page.styled";

type TeamMobileItemKey = (typeof teamSectionNavItems)[number]["key"];

type TeamMobilePresentation = {
  icon: ReactNode;
  descriptionKey: string;
};

const teamMobilePresentationByKey = {
  "team-members": {
    icon: <UsersThreeIcon />,
    descriptionKey: "team.mobile.descriptions.members",
  },
  "team-roles": {
    icon: <ShieldCheckIcon />,
    descriptionKey: "team.mobile.descriptions.roles",
  },
} satisfies Record<TeamMobileItemKey, TeamMobilePresentation>;

export const MobileTeamHubPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <S.Root>
      <S.Header>
        <S.PageTitle level={3}>{t("team.pageTitle")}</S.PageTitle>
      </S.Header>

      <S.ListCard>
        {teamSectionNavItems.map((item) => {
          const presentation = teamMobilePresentationByKey[item.key];

          return (
            <S.ItemButton
              key={item.key}
              type="text"
              block
              data-qa={`team-mobile-hub-item-${item.key}`}
              onClick={() => navigate(item.path)}
            >
              <S.ItemContent align="center" gap={12}>
                <S.IconTile aria-hidden="true">{presentation.icon}</S.IconTile>
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
      </S.ListCard>
    </S.Root>
  );
};
