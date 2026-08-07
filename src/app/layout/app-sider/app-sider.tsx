import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";

import {
  mainNavItems,
  isNavItemActive,
  type MainNavItem,
} from "@/app/router/navigation";

import * as S from "./app-sider.styled";

type SiderNavItemsProps = {
  items: readonly MainNavItem[];
};

const SiderNavItems = observer(({ items }: SiderNavItemsProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      {items.map((item) => {
        const isActive = isNavItemActive(item, location.pathname);
        const qaKey = item.path.replace(/\//g, "_").replace(/^_/, "") || "root";
        const label = t(item.labelKey);

        return (
          <S.NavItem
            key={item.path}
            type="button"
            aria-current={isActive ? "page" : undefined}
            onClick={() => {
              navigate(item.path);
            }}
            data-qa={`menu_sider_${qaKey}`}
          >
            <S.NavItemIcon>{item.icon}</S.NavItemIcon>
            <S.NavItemLabel>{label}</S.NavItemLabel>
          </S.NavItem>
        );
      })}
    </>
  );
});

export const AppSider = observer(() => {
  return (
    <S.Wrapper>
      <S.Nav>
        <SiderNavItems items={mainNavItems} />
      </S.Nav>
    </S.Wrapper>
  );
});
