import type { ReactNode } from "react";

import * as S from "./settings-shell.styled";

type SlotProps = {
  children?: ReactNode;
};

type SidebarProps = SlotProps & {
  $customWidth?: number;
};

export const SettingsShell = {
  Root: ({ children }: SlotProps) => <S.Root>{children}</S.Root>,

  Sidebar: ({ children, $customWidth }: SidebarProps) => (
    <S.Sidebar $customWidth={$customWidth}>{children}</S.Sidebar>
  ),

  Title: ({ children }: SlotProps) => <S.Title>{children}</S.Title>,

  SidebarScroll: ({ children }: SlotProps) => (
    <S.SidebarScroll>{children}</S.SidebarScroll>
  ),

  Content: ({ children }: SlotProps) => <S.Content>{children}</S.Content>,
};
