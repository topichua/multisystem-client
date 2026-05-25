import type { ReactNode } from 'react';

import * as S from './settings-shell.styled';

type SlotProps = {
  children?: ReactNode;
};

export const SettingsShell = {
  Root: ({ children }: SlotProps) => <S.Root>{children}</S.Root>,

  Sidebar: ({ children }: SlotProps) => <S.Sidebar>{children}</S.Sidebar>,

  Title: ({ children }: SlotProps) => <S.Title>{children}</S.Title>,

  SidebarScroll: ({ children }: SlotProps) => <S.SidebarScroll>{children}</S.SidebarScroll>,

  Content: ({ children }: SlotProps) => <S.Content>{children}</S.Content>,
};
