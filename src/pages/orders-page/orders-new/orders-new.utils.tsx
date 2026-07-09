import type { Client } from "@/features/clients/model/client.types";

import type { ClientWithVipMarker } from "./orders-new.types";

export const normalizeClientSearchText = (value: string) =>
  value.trim().toLocaleLowerCase();

export const normalizeClientPhoneSearchText = (value: string) =>
  value.replace(/\D/g, "");

export const formatClientContact = (client: Client) => {
  const instagramContact = client.instagramUserIds?.[0];
  const telegramContact = client.telegramUserIds?.[0];
  const contact = instagramContact ?? telegramContact;

  if (!contact) {
    return "—";
  }

  return contact.startsWith("@") ? contact : `@${contact}`;
};

export const isVipClient = (client: Client) => {
  const candidate = client as ClientWithVipMarker;

  return (
    candidate.vip === true ||
    candidate.isVip === true ||
    candidate.tags?.some((tag) => tag.toLocaleLowerCase() === "vip") === true
  );
};

export const formatProductAmount = (amount: number, currency: string) =>
  `${amount.toLocaleString("uk-UA")} ${currency}`.trim();

export const renderClientMeta = (client: Client) => (
  <>
    {client.phone || "—"}
    <span aria-hidden="true"> · </span>
    {formatClientContact(client)}
  </>
);
