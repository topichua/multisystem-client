import { UserIcon } from "@phosphor-icons/react";
import type { ComponentProps } from "react";

import * as S from "./user-avatar.styled";

type AntdAvatarProps = ComponentProps<typeof S.Avatar>;

export type UserAvatarProps = Omit<
  AntdAvatarProps,
  "children" | "icon" | "src"
> & {
  name?: string | null;
  src?: string | null;
};

function getUserAvatarInitials(value: string | null | undefined) {
  const source = value?.trim();
  if (!source) {
    return undefined;
  }

  const parts = source.split(/\s+/).filter(Boolean);
  const letters =
    parts.length > 1
      ? `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`
      : source.slice(0, 2);

  return letters.toUpperCase();
}

export const UserAvatar = ({ name, src, ...props }: UserAvatarProps) => {
  const avatarSrc = src || undefined;
  const initials = getUserAvatarInitials(name);

  return (
    <S.Avatar
      {...props}
      src={avatarSrc}
      icon={avatarSrc || initials ? undefined : <UserIcon />}
    >
      {avatarSrc ? null : initials}
    </S.Avatar>
  );
};
