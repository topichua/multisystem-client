import type { HTMLAttributes, ReactNode } from 'react';

import * as S from './pane-detail-layout.styled';

type RootProps = {
  children?: ReactNode;
  inset?: boolean;
} & Pick<HTMLAttributes<HTMLDivElement>, 'className' | 'style'>;

type SlotProps = {
  children?: ReactNode;
} & Omit<HTMLAttributes<HTMLDivElement>, 'children'>;

export const PaneDetailLayout = {
  Root: ({ children, inset = false, className, style }: RootProps) => (
    <S.Root $inset={inset} className={className} style={style}>
      {children}
    </S.Root>
  ),

  Header: ({ children, ...rest }: SlotProps) => <S.HeaderSlot {...rest}>{children}</S.HeaderSlot>,

  Body: ({ children, ...rest }: SlotProps) => <S.BodySlot {...rest}>{children}</S.BodySlot>,
};
