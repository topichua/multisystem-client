import { useTranslation } from "react-i18next";

import type { InstagramMediaFilter } from "@/features/instagram/model/instagram.types";

import {
  getFilterLabelKey,
  mediaFilters,
} from "../../utils/instagram-page-format";
import * as S from "../../instagram-page.styled";

type InstagramMediaFiltersProps = {
  activeFilter: InstagramMediaFilter;
  getFilterCount: (filter: InstagramMediaFilter) => number;
  onChange: (filter: InstagramMediaFilter) => void;
};

export const InstagramMediaFilters = ({
  activeFilter,
  getFilterCount,
  onChange,
}: InstagramMediaFiltersProps) => {
  const { t } = useTranslation();

  return (
    <S.FilterRow>
      {mediaFilters.map((filter) => {
        const active = activeFilter === filter;

        return (
          <S.FilterPill
            key={filter}
            type="button"
            $active={active}
            onClick={() => onChange(filter)}
          >
            {t(getFilterLabelKey(filter))}
            <S.FilterCount $active={active}>
              {getFilterCount(filter)}
            </S.FilterCount>
          </S.FilterPill>
        );
      })}
    </S.FilterRow>
  );
};
