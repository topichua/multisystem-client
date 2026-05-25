import type { HTMLAttributes, ReactNode } from 'react';

import * as S from './pane-nav-split-layout.styled';

type DivProps = {
  children?: ReactNode;
} & Omit<HTMLAttributes<HTMLDivElement>, 'children'>;

type AsideProps = {
  children?: ReactNode;
} & Omit<HTMLAttributes<HTMLElement>, 'children'>;

export const PaneNavSplitLayout = {
  Root: ({ children, ...rest }: DivProps) => <S.Root {...rest}>{children}</S.Root>,

  SubSidebar: ({ children, ...rest }: AsideProps) => (
    <S.SubSidebar {...rest}>{children}</S.SubSidebar>
  ),

  SubMain: ({ children, ...rest }: DivProps) => <S.SubMain {...rest}>{children}</S.SubMain>,
};
