import * as light from "./colors";

const grey = {
  1: "#0f1117",
  2: "#151922",
  3: "#1e2230",
  4: "#3d4456",
  5: "#6b7288",
  6: "#8b93a8",
  7: "#a8b0c4",
  8: "#c5cad8",
  9: "#e4e7ee",
  10: "#f4f5f8",
} as typeof light.base.grey;

export const brandPalette = light.brandPalette;

export const base = {
  ...light.base,
  grey,
};

export const semantic = {
  primary: light.brandPalette[5],
  neutral: grey[7],
  success: light.base.green[5],
  error: light.base.red[5],
  warning: light.base.yellow[6],
  info: light.brandPalette[5],
  promotion: light.base.pink[5],
  upgrade: light.base.violet[5],
};

export const functional = {
  border: {
    split: grey[3],
    base: grey[3],
    cardBase: grey[3],
    primary: light.brandPalette[5],
    outline: grey[5],
    outlineDisabled: grey[4],
    selected: light.brandPalette[6],
  },

  background: {
    appShell: "#121010",
    base: grey[1],
    elevated: grey[2],
    workspace: "#181818",
    primary: "#2a1f3d",
    natural: grey[2],
    success: "#0f291f",
    error: "#2f1519",
    warning: "#2d2600",
    promotion: "#261431",
    hover: grey[3],
    active: "#352648",
    disabled: grey[2],
  },

  text: {
    primary: grey[9],
    heading: grey[10],
    placeholder: grey[6],
    subdued: grey[7],
    inverted: grey[1],
    disabled: grey[5],
    warning: light.base.yellow[4],
    error: light.base.red[5],
    success: light.base.green[5],
  },

  link: { hover: light.brandPalette[4] },
};
