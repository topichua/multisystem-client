import type { ReactNode } from "react";

import type { Client } from "@/features/clients/model/client.types";

import * as S from "./client-order-drawer.styled";

type ClientOrderClientCardProps = {
  clientPic?: string;
  linkedClient: Client;
  title: ReactNode;
};

export function ClientOrderClientCard({
  clientPic,
  linkedClient,
  title,
}: ClientOrderClientCardProps) {
  const initials =
    `${linkedClient.firstName?.[0] ?? ""}${linkedClient.lastName?.[0] ?? ""}`
      .trim()
      .toUpperCase() || "?";
  const displayName =
    `${linkedClient.firstName} ${linkedClient.lastName}`.trim();

  return (
    <S.Section>
      <S.SectionHeader>{title}</S.SectionHeader>
      <S.ClientPanel>
        <S.ClientAvatar>
          {clientPic ? <img src={clientPic} alt={displayName} /> : initials}
        </S.ClientAvatar>
        <S.ClientCopy>
          <S.ClientName>{displayName}</S.ClientName>
          <S.ClientPhone>{linkedClient.phone || "-"}</S.ClientPhone>
        </S.ClientCopy>
      </S.ClientPanel>
    </S.Section>
  );
}
