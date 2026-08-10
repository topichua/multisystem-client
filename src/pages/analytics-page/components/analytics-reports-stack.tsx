import type { ReactNode } from "react";

import * as S from "./analytics-reports-stack.styled";

type AnalyticsReportsStackProps = {
  children: ReactNode;
  dataQa: string;
};

export const AnalyticsReportsStack = ({
  children,
  dataQa,
}: AnalyticsReportsStackProps) => <S.Root $dataQa={dataQa}>{children}</S.Root>;
