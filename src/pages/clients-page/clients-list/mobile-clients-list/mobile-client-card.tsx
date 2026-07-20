import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { getClientDetailsPath } from "@/app/router/pages-map";
import type { Client } from "@/features/clients/model/client.types";

import {
  formatClientDisplayName,
  formatClientDate,
  formatClientUahAmount,
  getClientInitials,
  getClientOrderStats,
} from "../client-display.utils";
import { ClientSourceTags } from "../client-source-tags";
import { MobileClientCardActions } from "./mobile-client-card-actions";
import * as S from "./mobile-clients-list-page.styled";

type MobileClientCardProps = {
  client: Client;
  deleteLoading: boolean;
  onEdit: (client: Client) => void;
  onDelete: (id: number) => Promise<void>;
};

export function MobileClientCard({
  client,
  deleteLoading,
  onEdit,
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
          <S.ClientAvatar size={40} src={client.avatar_src || undefined}>
            {getClientInitials(client)}
          </S.ClientAvatar>
          <S.ClientText>
            <S.ClientName>{displayName}</S.ClientName>
            {phone && <S.ClientPhone>{phone}</S.ClientPhone>}
          </S.ClientText>
        </S.ClientIdentity>
        <MobileClientCardActions
          client={client}
          deleteLoading={deleteLoading}
          actionsDataQa={`clients-mobile-actions-${client.id}`}
          editDataQa={`clients-mobile-edit-${client.id}`}
          deleteDataQa={`clients-mobile-delete-${client.id}`}
          onEdit={onEdit}
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
            {formatClientDate(orderStats?.lastOrderAt)}
          </S.MetadataValue>
        </S.MetadataRow>
      </S.Metadata>
    </S.ClientCard>
  );
}
