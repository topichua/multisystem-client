import { ArrowLeftIcon } from "@phosphor-icons/react";
import { Button } from "antd";
import { useTranslation } from "react-i18next";

import type { InstagramPostPageController } from "../../controllers/use-instagram-post-page-controller";
import * as S from "./instagram-post-detail-content.styled";

type InstagramPostDetailNavigationProps = {
  controller: InstagramPostPageController;
};

export const InstagramPostDetailNavigation = ({
  controller,
}: InstagramPostDetailNavigationProps) => {
  const { t } = useTranslation();

  return (
    <S.HeaderMain>
      <Button
        icon={<ArrowLeftIcon size={16} />}
        onClick={controller.navigateBack}
      >
        {t("instagram.backToPosts")}
      </Button>
    </S.HeaderMain>
  );
};
