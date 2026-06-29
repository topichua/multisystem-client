import { CaretRightIcon, UsersThreeIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { clientsSectionNavItems } from "@/app/router/navigation";

import * as S from "./mobile-clients-hub-page.styled";

type ClientsMobileItemKey = "clients-workspace";

type ClientsMobilePresentation = {
  icon: ReactNode;
  titleKey: string;
  descriptionKey: string;
};

const clientsMobilePresentationByKey = {
  "clients-workspace": {
    icon: <UsersThreeIcon />,
    titleKey: "clients.mobile.titles.clientsWorkspace",
    descriptionKey: "clients.mobile.descriptions.clientsWorkspace",
  },
} satisfies Record<ClientsMobileItemKey, ClientsMobilePresentation>;

export const MobileClientsHubPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <S.Root>
      <S.Header>
        <S.HeaderCopy vertical gap={4}>
          <S.PageTitle level={3}>{t("clients.shellTitle")}</S.PageTitle>
          <S.PageSubtitle>{t("clients.mobile.subtitle")}</S.PageSubtitle>
        </S.HeaderCopy>
      </S.Header>

      <S.ListCard>
        {clientsSectionNavItems.map((item) => {
          const presentation =
            clientsMobilePresentationByKey[item.key as ClientsMobileItemKey];

          return (
            <S.ItemButton
              key={item.key}
              type="text"
              block
              data-qa={`clients-mobile-hub-item-${item.key}`}
              onClick={() => navigate(item.path)}
            >
              <S.ItemContent align="center" gap={12}>
                <S.IconTile aria-hidden="true">{presentation.icon}</S.IconTile>
                <S.ItemCopy vertical gap={2}>
                  <S.ItemTitle>{t(presentation.titleKey)}</S.ItemTitle>
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
