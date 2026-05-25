import type { DefaultTheme } from 'styled-components';

import type { ThemeMode } from '@/theme/theme-mode.types';

import { APP_FONT_FAMILY } from '@/styled/constants';
import * as darkColors from '@/styled/definitions/colors.dark';
import * as lightColors from '@/styled/definitions/colors';
import { text, bigText } from '@/styled/definitions/font-size';
import { radiusDefinition } from '@/styled/definitions/radius';
import { shadowDefinition } from '@/styled/definitions/shadows';
import { spacingDefinition } from '@/styled/definitions/spacing';

export const buildAppTheme = (mode: ThemeMode): DefaultTheme => {
  const colors = mode === 'dark' ? darkColors : lightColors;

  return {
    spacing: spacingDefinition,
    fontSize: text,
    bigTextFontSize: bigText,
    fontFamily: APP_FONT_FAMILY,
    colors,
    radius: radiusDefinition,
    shadow: shadowDefinition,
  };
};
