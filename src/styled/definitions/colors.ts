import { generate } from '@ant-design/colors';

import { BRAND_PRIMARY } from '@/styled/brand';

type ColorIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type GeneratedColors = { [key in ColorIndex]: string };
type GenerateOptions = Parameters<typeof generate>[1];

function generateAntdColors(baseColor: string, options?: GenerateOptions): GeneratedColors {
  const colors = generate(baseColor, options);

  return colors.reduce(
    (accumulator, color, index) => ({ ...accumulator, [index + 1]: color }),
    {} as GeneratedColors,
  );
}

export const brandPalette = generateAntdColors(BRAND_PRIMARY);

// additional
const pinkBase = '#D5318C';
const volcanoBase = '#D55331';
const limeBase = '#8BD715';
const geekBlueBase = '#15A5DC';
const goldBase = '#E6E10E';
const magentaBase = '#C932D8';
const cyanBase = '#2BC9C8';
// const orangeBase = '#DA8D2D';

export const base = {
  black: '#000000',
  white: '#ffffff',
  blue: {
    1: '#F5F9FF',
    2: '#E9F2FF',
    3: '#D0E4FF',
    4: '#8EBAF8',
    5: '#5795EE',
    6: '#2372E2',
    7: '#004ECB',
    8: '#003785',
    9: '#002457',
    10: '#001636',
  },
  violet: {
    1: '#FAF7FD',
    2: '#F4EEFB',
    3: '#EADEF7',
    4: '#C9ACEB',
    5: '#A981E3',
    6: '#8D59DC',
    7: '#6F2FCC',
    8: '#4C1D90',
    9: '#31145D',
    10: '#1F0C3B',
  },
  green: {
    1: '#EFFAF7',
    2: '#E0F4EE',
    3: '#C7EBE1',
    4: '#66CAAF',
    5: '#2DA68B',
    6: '#2F836E',
    7: '#0E6352',
    8: '#054338',
    9: '#032C24',
    10: '#021B17',
  },
  red: {
    1: '#FEF7F8',
    2: '#FDECEF',
    3: '#FDDBE1',
    4: '#FA9EAD',
    5: '#EF687E',
    6: '#D23F57',
    7: '#A4283D',
    8: '#721928',
    9: '#4B101A',
    10: '#2E0B11',
  },
  yellow: {
    1: '#FEF9DC',
    2: '#FEF2BA',
    3: '#FBE472',
    4: '#D9B500',
    5: '#B09200',
    6: '#8C7300',
    7: '#695600',
    8: '#473A00',
    9: '#2D2600',
    10: '#1C1700',
  },
  pink: generateAntdColors(pinkBase), // #FFF0F6, #FFDEEC, #FCB3D4, #F084B8, #E359A0, #D5318C, #B02074, #8A125C, #630843, #3D042B
  volcano: generateAntdColors(volcanoBase), // #FFF5F0, #FFE9DE, #FCC9B3, #F0A184, #E37959, #D55331, #B03820, #8A2212, #631108, #3D0804
  lime: generateAntdColors(limeBase), // #F9FFE6, #EDFFBD, #DDFC92, #C1F065, #A5E33B, #8BD715, #68B009, #498A00, #326300, #1D3D00
  geekblue: generateAntdColors(geekBlueBase), // #E6FCFF, #BDF5FF, #94EBFF, #67D6F5, #3CBDE8, #15A5DC, #097FB5, #005D8F, #004069, #002742
  gold: generateAntdColors(goldBase), // #FBFFE6, #F6FFB3, #F5FF8A, #F7FF61, #EFF235, #E6E10E, #BFB602, #998C00, #736500, #4D4100
  magenta: generateAntdColors(magentaBase), // #FFF0FE, #FFDEFD, #FFB5FE, #F085F2, #DF5AE6, #C932D8, #A120B3, #7A128C, #550866, #330440
  cyan: generateAntdColors(cyanBase),
  orange: {
    1: '#FFF7ED',
    2: '#FFEFDC',
    3: '#FFDEBA',
    4: '#FFA333',
    5: '#E67600',
    6: '#B65E00',
    7: '#894600',
    8: '#5C3000',
    9: '#3C1F00',
    10: '#251300',
  },
  grey: {
    1: '#F8F8FB', // input backgrounds + border, body base background
    2: '#EFF0F4', // dividers, borders and background of ghost button
    3: '#E1E3EA', // used as circle on candidate tag that does not have color
    4: '#B2B7CB', // disabled text
    5: '#8B93B4', // input placeholder color
    6: '#6A749B', // natural gray
    7: '#4E5777', // subdued text
    8: '#353A51', // text in ghost buttons
    9: '#222533', // text
    10: '#15171F', // heading
  },
};

export const semantic = {
  primary: brandPalette[7],
  neutral: base.grey[7],
  success: base.green[7],
  error: base.red[7],
  warning: base.yellow[7],
  info: brandPalette[7],
  promotion: base.pink[7],
  upgrade: base.violet[7],
};

export const functional = {
  border: {
    split: base.grey[2],
    base: base.grey[2],
    cardBase: base.grey[3],
    primary: brandPalette[3],
    outline: base.grey[4],
    outlineDisabled: base.grey[3],
    selected: brandPalette[5],
  },

  background: {
    base: base.grey[1],
    elevated: base.white,
    primary: brandPalette[2],
    natural: base.grey[2],
    success: base.green[2],
    error: base.red[2],
    warning: base.yellow[2],
    promotion: base.violet[2],
    hover: base.grey[2], // hover on select items
    active: brandPalette[2], // active element in select
    disabled: base.white,
  },

  text: {
    primary: base.grey[9],
    heading: base.grey[10],
    placeholder: base.grey[6],
    // medium: base.ink[300],
    subdued: base.grey[7],
    inverted: base.white,
    disabled: base.grey[5],
    warning: base.yellow[8],
    error: base.red[7],
    success: base.green[8],
  },

  link: { hover: brandPalette[5] },
};
