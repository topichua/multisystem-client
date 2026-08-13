import type { HTMLAttributes } from "react";
import { useTranslation } from "react-i18next";
import styled, { useTheme } from "styled-components";

import type { MemberWorkStatus } from "@/features/auth/model/auth-session.types";

import {
  DEFAULT_MEMBER_WORK_STATUS,
  getMemberWorkStatusColors,
} from "./member-work-status";
import { MemberWorkStatusDot } from "./member-work-status.styled";

const Root = styled.span`
  min-width: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

const Label = styled.span`
  min-width: 0;
  color: ${({ theme }) => theme.colors.functional.text.heading};
  line-height: 1.2;
`;

export type MemberWorkStatusLabelProps = Omit<
  HTMLAttributes<HTMLSpanElement>,
  "children"
> & {
  status?: MemberWorkStatus | null;
};

export function MemberWorkStatusLabel({
  status,
  ...props
}: MemberWorkStatusLabelProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const resolvedStatus = status ?? DEFAULT_MEMBER_WORK_STATUS;
  const colors = getMemberWorkStatusColors(theme);

  return (
    <Root {...props}>
      <MemberWorkStatusDot $color={colors[resolvedStatus]} />
      <Label>{t(`appHeader.workStatus.${resolvedStatus}.button`)}</Label>
    </Root>
  );
}
