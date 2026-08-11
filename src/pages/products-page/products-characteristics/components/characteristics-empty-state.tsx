import { ListBulletsIcon, PlusIcon } from "@phosphor-icons/react";
import { Button } from "antd";
import { useTranslation } from "react-i18next";

import * as S from "./characteristics-empty-state.styled";

type CharacteristicsEmptyStateProps = {
  onCreateClick: () => void;
  onAddLibraryClick?: () => void;
};

export const CharacteristicsEmptyState = ({
  onCreateClick,
  onAddLibraryClick,
}: CharacteristicsEmptyStateProps) => {
  const { t } = useTranslation();

  return (
    <S.Root data-qa="layout-products-characteristics-empty">
      <S.Content>
        <S.IconBadge aria-hidden>
          <ListBulletsIcon size={28} weight="regular" />
        </S.IconBadge>

        <S.Title>{t("characteristics.emptyState")}</S.Title>
        <S.Description>
          {t("characteristics.emptyStateDescription")}
        </S.Description>

        <S.Actions>
          <Button
            type="primary"
            icon={<PlusIcon size={16} />}
            onClick={onCreateClick}
          >
            {t("characteristics.emptyStateCreate")}
          </Button>
          <Button type="text" onClick={onAddLibraryClick}>
            {t("characteristics.emptyStateAddLibrary")}
          </Button>
        </S.Actions>
      </S.Content>
    </S.Root>
  );
};
