import type { ConversationSource } from "@/features/conversations/model/types";
import type {
  VariantWishlistClient,
  WishlistClientSocialUser,
} from "@/features/wishlist/model/wishlist.types";
import { formatClientDisplayName } from "@/pages/clients-page/clients-list/client-display.utils";

export type VariantWishlistClientChannel = {
  source: ConversationSource;
  username: string | null;
  avatar: string | null;
};

function getPrimarySocialUser(
  users: WishlistClientSocialUser[],
): WishlistClientSocialUser | null {
  return users[0] ?? null;
}

export function getVariantWishlistClientChannel(
  client: VariantWishlistClient,
): VariantWishlistClientChannel | null {
  const instagramUser = getPrimarySocialUser(client.instagramUsers);
  if (instagramUser || client.instagramUserIds.length > 0) {
    return {
      source: 1,
      username: instagramUser?.username ?? null,
      avatar: instagramUser?.avatar ?? null,
    };
  }

  const telegramUser = getPrimarySocialUser(client.telegramUsers);
  if (telegramUser || client.telegramUserIds.length > 0) {
    return {
      source: 2,
      username: telegramUser?.username ?? null,
      avatar: telegramUser?.avatar ?? null,
    };
  }

  return null;
}

export function getVariantWishlistClientDisplayName(
  client: VariantWishlistClient,
): string {
  return formatClientDisplayName(client);
}

export function getVariantWishlistClientAvatarSrc(
  client: VariantWishlistClient,
  channel: VariantWishlistClientChannel | null,
): string | undefined {
  return client.avatar_src || channel?.avatar || undefined;
}

export function formatWishlistUsername(
  username: string | null | undefined,
): string | null {
  const value = username?.trim();
  if (!value) {
    return null;
  }

  return value.startsWith("@") ? value : `@${value}`;
}
