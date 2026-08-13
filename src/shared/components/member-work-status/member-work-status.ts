import type { DefaultTheme } from "styled-components";

import type { MemberWorkStatus } from "@/features/auth/model/auth-session.types";

export const DEFAULT_MEMBER_WORK_STATUS: MemberWorkStatus =
  "not_accepting_new_chats";

export function getMemberWorkStatusColors(
  theme: DefaultTheme,
): Record<MemberWorkStatus, string> {
  return {
    accepting_new_chats: theme.colors.semantic.success,
    not_accepting_new_chats: theme.colors.functional.text.subdued,
    break: theme.colors.base.blue[6],
  };
}
