import { CaretRightIcon } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { AnalyticsProBadge } from "../../components/analytics-pro-badge.styled";
import { ANALYTICS_ADVANCED_REPORT_ITEMS } from "../constants/analytics-advanced-reports";

import * as S from "./analytics-overview-advanced-section.styled";

export const AnalyticsOverviewAdvancedSection = () => {
  const { t } = useTranslation();

  return (
    <S.Section>
      <S.SectionHeader>
        <S.SectionTitle>
          {t("analytics.overview.advancedAnalytics.sectionTitle")}
        </S.SectionTitle>
        <S.SectionBadge>
          {t("analytics.overview.advancedAnalytics.availableOnPro")}
        </S.SectionBadge>
      </S.SectionHeader>

      <S.Grid>
        {ANALYTICS_ADVANCED_REPORT_ITEMS.map((item) => {
          const Icon = item.icon;

          return (
            <S.CardLink
              key={item.key}
              as={Link}
              to={item.path}
              data-qa={`analytics-overview-advanced-card-${item.key}`}
            >
              <S.IconTile $accent={item.accent} $accentBg={item.accentBg}>
                <Icon weight="duotone" />
              </S.IconTile>

              <S.Copy>
                <S.TitleRow>
                  <S.Title>{t(item.titleKey)}</S.Title>
                  <AnalyticsProBadge>
                    {t("analytics.menu.proBadge")}
                  </AnalyticsProBadge>
                </S.TitleRow>
                <S.Description>{t(item.descriptionKey)}</S.Description>
              </S.Copy>

              <S.DetailsLink>
                {t("analytics.overview.advancedAnalytics.detailsLink")}
                <CaretRightIcon weight="bold" />
              </S.DetailsLink>
            </S.CardLink>
          );
        })}
      </S.Grid>
    </S.Section>
  );
};
