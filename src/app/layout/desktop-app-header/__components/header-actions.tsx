import * as S from "../desktop-app-header.styled";

import { HeaderLanguage } from "./header-language";
import { HeaderLogout } from "./header-logout";
import { HeaderProfile } from "./header-profile";
import { HeaderThemeToggle } from "./header-theme-toggle";
import { HeaderWorkStatus } from "./header-work-status";

export const HeaderActions = () => {
  return (
    <S.Actions>
      <HeaderProfile />
      <HeaderWorkStatus />
      <S.CustomDivider />
      <HeaderThemeToggle />
      <HeaderLanguage />
      <HeaderLogout />
    </S.Actions>
  );
};
