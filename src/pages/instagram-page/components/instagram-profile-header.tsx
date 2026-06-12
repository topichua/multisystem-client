import { useTranslation } from "react-i18next";

import type {
  InstagramIntegration,
  InstagramMediaPaging,
} from "@/features/instagram/model/instagram.types";

import {
  formatCompactNumber,
  formatHandle,
} from "../utils/instagram-page-format";
import * as S from "../instagram-page.styled";

type InstagramProfileHeaderProps = {
  integration: InstagramIntegration;
  mediaPaging: InstagramMediaPaging | null;
};

export const InstagramProfileHeader = ({
  integration,
  mediaPaging,
}: InstagramProfileHeaderProps) => {
  const { t } = useTranslation();

  return (
    <S.ProfileHeader>
      <S.ProfileAvatar />
      <S.ProfileMeta>
        <S.ProfileName>{formatHandle(integration.name)}</S.ProfileName>
        <S.ProfileDisplayName>{integration.name}</S.ProfileDisplayName>
        <S.ProfileStats>
          <span>
            <strong>
              {formatCompactNumber(
                integration.media_count ?? mediaPaging?.total,
              )}
            </strong>{" "}
            {t("instagram.postsLabel")}
          </span>
          <span>
            <strong>{formatCompactNumber(integration.followers_count)}</strong>{" "}
            {t("instagram.followersLabel")}
          </span>
        </S.ProfileStats>
      </S.ProfileMeta>
    </S.ProfileHeader>
  );
};
