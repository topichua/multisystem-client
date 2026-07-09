import type { ReactNode } from "react";

import * as S from "./analytics-content-layout.styled";

type AnalyticsContentLayoutProps = {
  toolbar?: ReactNode;
  children: ReactNode;
};

export const AnalyticsContentLayout = ({
  toolbar,
  children,
}: AnalyticsContentLayoutProps) => (
  <S.Root>
    {toolbar ? <S.ToolbarRow>{toolbar}</S.ToolbarRow> : null}
    <S.Content>{children}</S.Content>
  </S.Root>
);
