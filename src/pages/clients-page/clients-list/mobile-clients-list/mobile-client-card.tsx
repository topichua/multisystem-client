import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { getClientDetailsPath } from "@/app/router/pages-map";
import { UserAvatar } from "@/components/user-avatar";
import type { Client } from "@/features/clients/model/client.types";
import { formatDate } from "@/utils/date-time";

import {
  formatClientDisplayName,
  formatClientUahAmount,
  getClientOrderStats,
} from "../client-display.utils";
import { ClientSourceTags } from "../client-source-tags";
import { MobileClientCardActions } from "./mobile-client-card-actions";
import * as S from "./mobile-clients-list-page.styled";

type MobileClientCardProps = {
  client: Client;
  blockLoading: boolean;
  deleteLoading: boolean;
  onEdit: (client: Client) => void;
  onToggleBlock: (client: Client) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
};

export function MobileClientCard({
  client,
  blockLoading,
  deleteLoading,
  onEdit,
  onToggleBlock,
  onDelete,
}: MobileClientCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const displayName = formatClientDisplayName(client);
  const phone = client.phone?.trim();
  const orderStats = getClientOrderStats(client);

  return (
    <S.ClientCard
      data-qa={`clients-mobile-card-${client.id}`}
      aria-label={t("clients.mobile.clientCardAria", { name: displayName })}
      style={{ cursor: "pointer" }}
      onClick={(event) => {
        const target = event.target as HTMLElement;

        if (
          target.closest("button") ||
          target.closest("a") ||
          target.closest(".ant-dropdown")
        ) {
          return;
        }

        navigate(getClientDetailsPath(client.id));
      }}
    >
      <S.CardHeader>
        <S.ClientIdentity>
          <UserAvatar size={40} name={displayName} src={client.avatar_src} />
          <S.ClientText>
            <S.ClientName>{displayName}</S.ClientName>
            {phone && <S.ClientPhone>{phone}</S.ClientPhone>}
          </S.ClientText>
        </S.ClientIdentity>
        <MobileClientCardActions
          client={client}
          blockLoading={blockLoading}
          deleteLoading={deleteLoading}
          actionsDataQa={`clients-mobile-actions-${client.id}`}
          editDataQa={`clients-mobile-edit-${client.id}`}
          blockDataQa={`clients-mobile-block-${client.id}`}
          deleteDataQa={`clients-mobile-delete-${client.id}`}
          onEdit={onEdit}
          onToggleBlock={onToggleBlock}
          onDelete={onDelete}
        />
      </S.CardHeader>

      <S.Metadata>
        <S.MetadataRow>
          <S.MetadataLabel>{t("clients.table.source")}</S.MetadataLabel>
          <S.MetadataValue style={{ whiteSpace: "normal" }}>
            <ClientSourceTags client={client} />
          </S.MetadataValue>
        </S.MetadataRow>
        <S.MetadataRow>
          <S.MetadataLabel>{t("clients.table.orders")}</S.MetadataLabel>
          <S.MetadataValue>{orderStats?.orderCount ?? 0}</S.MetadataValue>
        </S.MetadataRow>
        <S.MetadataRow>
          <S.MetadataLabel>{t("clients.table.totalSpent")}</S.MetadataLabel>
          <S.MetadataValue>
            {formatClientUahAmount(orderStats?.totalSpent)}
          </S.MetadataValue>
        </S.MetadataRow>
        <S.MetadataRow>
          <S.MetadataLabel>{t("clients.table.lastOrder")}</S.MetadataLabel>
          <S.MetadataValue>
            {formatDate(orderStats?.lastOrderAt ?? "") || "—"}
          </S.MetadataValue>
        </S.MetadataRow>
      </S.Metadata>
    </S.ClientCard>
  );
}
