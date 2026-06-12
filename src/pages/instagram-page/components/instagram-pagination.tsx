import { Button, Typography } from "antd";
import { useTranslation } from "react-i18next";

import * as S from "../instagram-page.styled";

const { Text } = Typography;

type InstagramPaginationProps = {
  page: number;
  loading: boolean;
  canLoadPrevious: boolean;
  canLoadNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

export const InstagramPagination = ({
  page,
  loading,
  canLoadPrevious,
  canLoadNext,
  onPrevious,
  onNext,
}: InstagramPaginationProps) => {
  const { t } = useTranslation();

  return (
    <S.PaginationRow>
      <Button
        disabled={!canLoadPrevious}
        loading={loading}
        onClick={onPrevious}
      >
        {t("instagram.previousPage")}
      </Button>
      <Text type="secondary">{t("instagram.pageLabel", { page })}</Text>
      <Button disabled={!canLoadNext} loading={loading} onClick={onNext}>
        {t("instagram.nextPage")}
      </Button>
    </S.PaginationRow>
  );
};
