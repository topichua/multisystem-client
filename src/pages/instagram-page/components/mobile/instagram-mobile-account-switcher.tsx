import { Avatar, Spin } from "antd";
import { useTranslation } from "react-i18next";

import type { InstagramIntegration } from "@/features/instagram/model/instagram.types";

import {
  formatCompactNumber,
  formatHandle,
} from "../../utils/instagram-page-format";
import * as S from "./instagram-mobile-account-switcher.styled";

type InstagramMobileAccountSwitcherProps = {
  integrations: InstagramIntegration[];
  loading: boolean;
  selectedKey?: string;
  onSelect: (key: string) => void;
};

const getAccountQaId = (integration: InstagramIntegration): string =>
  String(integration.integration_id).replace(/[^a-zA-Z0-9_-]/g, "-");

export const InstagramMobileAccountSwitcher = ({
  integrations,
  loading,
  selectedKey,
  onSelect,
}: InstagramMobileAccountSwitcherProps) => {
  const { t } = useTranslation();

  if (loading && integrations.length === 0) {
    return (
      <S.LoadingSlot>
        <Spin size="small" />
      </S.LoadingSlot>
    );
  }

  if (integrations.length === 0) {
    return null;
  }

  return (
    <S.Root aria-label={t("instagram.mobile.accountSwitcherLabel")}>
      {integrations.map((integration) => {
        const key = String(integration.integration_id);
        const active = selectedKey === key;
        const postsCount = integration.posts_count ?? integration.media_count;
        const metaParts = [
          postsCount != null
            ? `${formatCompactNumber(postsCount)} ${t("instagram.postsLabel")}`
            : null,
          integration.followers_count != null
            ? `${formatCompactNumber(integration.followers_count)} ${t(
                "instagram.followersLabel",
              )}`
            : null,
        ].filter(Boolean);

        return (
          <S.AccountChip
            key={key}
            type="button"
            $active={active}
            aria-pressed={active}
            aria-label={t("instagram.mobile.selectAccountAria", {
              name: integration.name,
            })}
            data-qa={`instagram-mobile-account-${getAccountQaId(integration)}`}
            onClick={() => onSelect(key)}
          >
            <Avatar size={30} src={integration.avatar} alt="">
              {integration.name.charAt(0).toUpperCase()}
            </Avatar>
            <S.AccountCopy>
              <S.AccountName>
                {formatHandle(integration.username ?? integration.name)}
              </S.AccountName>
              {metaParts.length > 0 ? (
                <S.AccountMeta>{metaParts.join(" · ")}</S.AccountMeta>
              ) : null}
            </S.AccountCopy>
          </S.AccountChip>
        );
      })}
    </S.Root>
  );
};
