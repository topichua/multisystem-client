import { CaretRightIcon } from "@phosphor-icons/react";
import { Flex } from "antd";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { analyticsSectionNavItems } from "@/app/router/navigation";

import * as S from "./mobile-analytics-hub-page.styled";

export const MobileAnalyticsHubPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <S.Root>
      <S.Header>
        <S.PageTitle level={3}>{t("analytics.pageTitle")}</S.PageTitle>
      </S.Header>

      <S.ListCard>
        {analyticsSectionNavItems.map((item) => (
          <S.ItemButton
            key={item.key}
            type="text"
            block
            data-qa={`analytics-mobile-hub-item-${item.key}`}
            onClick={() => navigate(item.path)}
          >
            <S.ItemContent align="center" gap={12}>
              <S.ItemCopy vertical gap={2}>
                <S.ItemTitle>{t(item.labelKey)}</S.ItemTitle>
              </S.ItemCopy>
              <Flex align="center" gap={8}>
                {"pro" in item && item.pro && (
                  <S.ProBadge>{t("analytics.menu.proBadge")}</S.ProBadge>
                )}
                <S.Caret aria-hidden="true">
                  <CaretRightIcon size={18} />
                </S.Caret>
              </Flex>
            </S.ItemContent>
          </S.ItemButton>
        ))}
      </S.ListCard>
    </S.Root>
  );
};
