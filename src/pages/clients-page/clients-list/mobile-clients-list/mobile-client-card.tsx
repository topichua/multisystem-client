import { useTranslation } from "react-i18next";

import type { Client } from "@/features/clients/model/client.types";
import { formatDateTime } from "@/utils/date-time";

import {
  formatClientDisplayName,
  getClientInitials,
} from "../client-display.utils";
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
  const displayName = formatClientDisplayName(client);
  const phone = client.phone?.trim();
  const deliveryInfo = client.deliveryInfo?.trim();

  return (
    <S.ClientCard
      data-qa={`clients-mobile-card-${client.id}`}
      aria-label={t("clients.mobile.clientCardAria", { name: displayName })}
    >
      <S.CardHeader>
        <S.ClientIdentity>
          <S.ClientAvatar size={40}>{getClientInitials(client)}</S.ClientAvatar>
          <S.ClientText>
            <S.ClientName>{displayName}</S.ClientName>
            {phone ? <S.ClientPhone>{phone}</S.ClientPhone> : null}
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
          <S.MetadataLabel>{t("clients.tableColumnDelivery")}</S.MetadataLabel>
          <S.MetadataValue>{deliveryInfo || "—"}</S.MetadataValue>
        </S.MetadataRow>
        <S.MetadataRow>
          <S.MetadataLabel>{t("clients.created")}</S.MetadataLabel>
          <S.MetadataValue>{formatDateTime(client.createdAt)}</S.MetadataValue>
        </S.MetadataRow>
      </S.Metadata>
    </S.ClientCard>
  );
}
