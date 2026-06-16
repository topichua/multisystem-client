import type { HTMLAttributes, ReactNode } from "react";

import * as S from "./pane-nav-split-layout.styled";

type DivProps = {
  children?: ReactNode;
  customWidth?: number;
  $customWidth?: number;
} & Omit<HTMLAttributes<HTMLDivElement>, 'children'>;

type AsideProps = {
  children?: ReactNode;
} & Omit<HTMLAttributes<HTMLElement>, "children">;

export const PaneNavSplitLayout = {
  Root: ({ children, $customWidth = 300, ...rest }: DivProps) => (
    <S.Root $customWidth={$customWidth} {...rest}>
      {children}
    </S.Root>
  ),

  SubSidebar: ({ children, ...rest }: AsideProps) => (
    <S.SubSidebar {...rest}>{children}</S.SubSidebar>
  ),

  SubMain: ({ children, ...rest }: DivProps) => (
    <S.SubMain {...rest}>{children}</S.SubMain>
  ),
};
