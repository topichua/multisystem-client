import 'styled-components';
import type * as colorsDefinition from './definitions/colors';
import type { bigText, text } from './definitions/fontSize';
import type { radiusDefinition } from './definitions/radius';
import type { shadowDefinition } from './definitions/shadows';
import type { spacingDefinition } from './definitions/spacing';

declare module 'styled-components' {
  export interface DefaultTheme {
    spacing: typeof spacingDefinition;
    fontSize: typeof text;
    bigTextFontSize: typeof bigText;
    fontFamily: string;
    colors: typeof colorsDefinition;
    radius: typeof radiusDefinition;
    shadow: typeof shadowDefinition;
  }
}
