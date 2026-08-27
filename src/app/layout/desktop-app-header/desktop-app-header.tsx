import { HeaderActions } from "./__components/header-actions";
import { HeaderBrand } from "./__components/header-brand";
import { HeaderCreateMenu } from "./__components/header-create-menu";
import { HeaderSearch } from "./__components/header-search";
import * as S from "./desktop-app-header.styled";

export const DesktopAppHeader = () => {
  return (
    <S.Header>
      <HeaderBrand />
      <HeaderCreateMenu />
      <HeaderSearch />
      <HeaderActions />
    </S.Header>
  );
};
