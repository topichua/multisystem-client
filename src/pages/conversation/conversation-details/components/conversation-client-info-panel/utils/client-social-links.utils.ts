import type {
  Client,
  ClientLinkProvider,
  ClientSocialLinkRecord,
  ClientSocialUserRecord,
} from "@/features/clients/model/client.types";
import type { Conversation } from "@/features/conversations/model/types";

export type ClientSocialLinkView = ClientSocialLinkRecord & {
  label: string;
};

const formatSocialHandle = (value: string): string => {
  const trimmed = value.trim();

  if (!trimmed) {
    return "—";
  }

  return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
};

const resolveConversationLinkLabel = (
  conversation: Conversation,
  externalId: string,
): string | null => {
  const participantId =
    conversation.participant.id != null
      ? String(conversation.participant.id)
      : null;

  if (participantId !== externalId) {
    return null;
  }

  const username = conversation.participant.username?.trim();

  return username ? formatSocialHandle(username) : null;
};

const resolveSocialLinkLabel = (
  provider: ClientLinkProvider,
  externalId: string,
  username: string | null | undefined,
  fullName: string | null | undefined,
  conversation?: Conversation,
): string => {
  if (username?.trim()) {
    return formatSocialHandle(username);
  }

  if (
    conversation &&
    conversation.channel === provider &&
    resolveConversationLinkLabel(conversation, externalId)
  ) {
    return resolveConversationLinkLabel(conversation, externalId)!;
  }

  if (fullName?.trim()) {
    return fullName.trim();
  }

  if (!/^\d+$/.test(externalId)) {
    return formatSocialHandle(externalId);
  }

  return externalId;
};

const buildLinksFromIds = (
  provider: ClientLinkProvider,
  externalIds: string[],
  conversation?: Conversation,
): ClientSocialLinkView[] =>
  externalIds.map((externalId) => ({
    provider,
    externalId,
    label: resolveSocialLinkLabel(
      provider,
      externalId,
      null,
      null,
      conversation,
    ),
  }));

const buildLinksFromSocialUsers = (
  provider: ClientLinkProvider,
  users: ClientSocialUserRecord[],
  conversation?: Conversation,
): ClientSocialLinkView[] =>
  users.map((user) => ({
    provider,
    externalId: user.id,
    username: user.username,
    label: resolveSocialLinkLabel(
      provider,
      user.id,
      user.username,
      user.fullName,
      conversation,
    ),
  }));

export function getClientSocialLinks(
  client: Client,
  conversation?: Conversation,
): ClientSocialLinkView[] {
  if (client.links?.length) {
    return client.links.map((link) => ({
      ...link,
      label: resolveSocialLinkLabel(
        link.provider,
        link.externalId,
        link.username,
        null,
        conversation,
      ),
    }));
  }

  const socialUserLinks = [
    ...buildLinksFromSocialUsers(
      "instagram",
      client.instagramUsers ?? [],
      conversation,
    ),
    ...buildLinksFromSocialUsers(
      "telegram",
      client.telegramUsers ?? [],
      conversation,
    ),
  ];

  if (socialUserLinks.length > 0) {
    return socialUserLinks;
  }

  return [
    ...buildLinksFromIds("instagram", client.instagramUserIds, conversation),
    ...buildLinksFromIds("telegram", client.telegramUserIds, conversation),
  ];
}

export function isCurrentConversationLink(
  link: ClientSocialLinkRecord,
  conversation: Conversation,
): boolean {
  const participantId =
    conversation.participant.id != null
      ? String(conversation.participant.id)
      : null;

  return (
    participantId != null &&
    conversation.channel === link.provider &&
    participantId === link.externalId
  );
}
