import { ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';
import ukUA from 'antd/locale/uk_UA';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/uk';
import type { ReactNode } from 'react';
import { useEffect, useMemo } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { ThemeProvider } from 'styled-components';

import i18n from '@/i18n';
import { createAntdTheme } from '@/styled/antd-theme';
import { GlobalStyle } from '@/styled/global.styled';
import { buildAppTheme } from '@/styled/build-app-theme';
import { ThemeModeProvider } from '@/theme/theme-mode-provider';
import { useThemeMode } from '@/theme/use-theme-mode';

function StyledThemeShell({ children }: { children: ReactNode }) {
  const { mode } = useThemeMode();
  const scTheme = useMemo(() => buildAppTheme(mode), [mode]);

  return (
    <ThemeProvider theme={scTheme}>
      <GlobalStyle />
      {children}
    </ThemeProvider>
  );
}

function AntConfigBridge({ children }: { children: ReactNode }) {
  const { i18n: i18nInstance } = useTranslation();
  const { mode } = useThemeMode();
  const antdTheme = useMemo(() => createAntdTheme(mode), [mode]);

  const lang = i18nInstance.language.startsWith('uk') ? 'uk' : 'en';

  useEffect(() => {
    document.documentElement.lang = lang === 'uk' ? 'uk' : 'en';
    void dayjs.locale(lang === 'uk' ? 'uk' : 'en');
  }, [lang]);

  const locale = lang === 'uk' ? ukUA : enUS;

  return (
    <ConfigProvider locale={locale} theme={antdTheme}>
      {children}
    </ConfigProvider>
  );
}

export const RootProviders = ({ children }: { children: ReactNode }) => (
  <ThemeModeProvider>
    <StyledThemeShell>
      <I18nextProvider i18n={i18n}>
        <AntConfigBridge>{children}</AntConfigBridge>
      </I18nextProvider>
    </StyledThemeShell>
  </ThemeModeProvider>
);
