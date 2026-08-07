import type { MenuProps } from 'antd';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation, useNavigate } from 'react-router';

import {
  getSelectedSectionNavPath,
  type SectionNavGroup,
  type SectionNavItem,
} from '@/app/router/navigation';
import { useIsMobileViewport } from '@/utils/use-media-query';

import { SettingsShell } from '../settings-shell/settings-shell';
import * as S from './desktop-section-shell.styled';

type DesktopSectionShellProps = {
  navDataQa: string;
  titleKey: string;
  mobileWrapper?: (children: ReactNode) => ReactNode;
} & (
  | {
      items: readonly SectionNavItem[];
      groups?: undefined;
    }
  | {
      groups: readonly SectionNavGroup[];
      items?: undefined;
    }
);

export const DesktopSectionShell = ({
  items,
  groups,
  navDataQa,
  titleKey,
  mobileWrapper,
}: DesktopSectionShellProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobileViewport = useIsMobileViewport();
  const outlet = <Outlet />;

  const flatItems = useMemo(
    () => groups?.flatMap((group) => group.items) ?? items ?? [],
    [groups, items],
  );

  const menuItems: MenuProps['items'] = useMemo(() => {
    if (groups) {
      return groups.map((group) => ({
        type: 'group' as const,
        key: group.key,
        label: <S.GroupLabel>{t(group.titleKey)}</S.GroupLabel>,
        children: group.items.map((item) => ({
          key: item.path,
          label: t(item.labelKey),
        })),
      }));
    }

    return flatItems.map((item) => ({
      key: item.path,
      label: t(item.labelKey),
    }));
  }, [flatItems, groups, t]);

  const selectedKey = useMemo(
    () => getSelectedSectionNavPath(flatItems, location.pathname),
    [flatItems, location.pathname],
  );

  if (isMobileViewport) {
    return <>{mobileWrapper ? mobileWrapper(outlet) : outlet}</>;
  }

  return (
    <SettingsShell.Root>
      <SettingsShell.Sidebar>
        <SettingsShell.Title>{t(titleKey)}</SettingsShell.Title>
        <SettingsShell.SidebarScroll>
          <div data-qa={navDataQa}>
            <S.NavMenu
              mode="inline"
              selectedKeys={[selectedKey]}
              items={menuItems}
              onClick={({ key }) => navigate(String(key))}
            />
          </div>
        </SettingsShell.SidebarScroll>
      </SettingsShell.Sidebar>
      <SettingsShell.Content>{outlet}</SettingsShell.Content>
    </SettingsShell.Root>
  );
};
