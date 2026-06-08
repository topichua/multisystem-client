import type { ThemeConfig } from "antd";
import { theme } from "antd";

import type { ThemeMode } from "@/theme/theme-mode.types";
import { BRAND_PRIMARY } from "@/styled/brand";
import { APP_CODE_FONT_FAMILY, APP_FONT_FAMILY } from "@/styled/constants";

const shared: ThemeConfig["token"] = {
  fontFamily: APP_FONT_FAMILY,
  fontFamilyCode: APP_CODE_FONT_FAMILY,
  fontSize: 14,
  lineHeight: 1.45,
  borderRadiusSM: 6,
  borderRadius: 8,
  borderRadiusLG: 12,
  colorPrimary: BRAND_PRIMARY,
  wireframe: false,
};

const lightColors = {
  primary: BRAND_PRIMARY,
  primaryHover: "#8377d6",
  primaryActive: "#5d51ba",
  primarySoft: "#ece9f9",
  primarySoftHover: "#ddd7f3",

  success: "#259060",
  warning: "#c97d1e",
  error: "#d43a2a",
  info: "#2c7bc8",

  bgBase: "#ffffff",
  bgLayout: "#fafafb",
  bgContainer: "#ffffff",
  bgElevated: "#f7f7f9",
  bgSpotlight: "#26262c",
  bgFill: "#f0f0f3",
  tableHeader: "#f0f0f3",

  text: "#26262c",
  textSecondary: "#57575f",
  textTertiary: "#7f7f88",
  textQuaternary: "#ababb3",

  border: "#c9c9cf",
  borderSecondary: "#ededf0",

  shadow: "0 12px 32px rgba(38, 38, 44, 0.08)",
  focusShadow: "0 0 0 2px rgba(110, 98, 205, 0.16)",
} as const;

export const lightTheme: ThemeConfig = {
  algorithm: theme.defaultAlgorithm,

  token: {
    ...shared,

    colorSuccess: lightColors.success,
    colorWarning: lightColors.warning,
    colorError: lightColors.error,
    colorInfo: lightColors.info,

    colorBgBase: lightColors.bgBase,
    colorBgLayout: lightColors.bgLayout,
    colorBgContainer: lightColors.bgContainer,
    colorBgElevated: lightColors.bgElevated,
    colorBgSpotlight: lightColors.bgSpotlight,

    colorTextBase: lightColors.text,
    colorText: lightColors.text,
    colorTextSecondary: lightColors.textSecondary,
    colorTextTertiary: lightColors.textTertiary,
    colorTextQuaternary: lightColors.textQuaternary,
    colorTextDisabled: lightColors.textQuaternary,

    colorBorder: lightColors.border,
    colorBorderSecondary: lightColors.borderSecondary,
    colorSplit: lightColors.borderSecondary,

    colorFillSecondary: lightColors.bgFill,
    controlItemBgHover: lightColors.bgFill,
    controlItemBgActive: lightColors.primarySoft,
    colorPrimaryBg: lightColors.primarySoft,
    colorPrimaryBgHover: lightColors.primarySoftHover,

    fontSizeHeading1: 32,
    fontSizeHeading2: 24,
    fontSizeHeading3: 20,

    boxShadow: lightColors.shadow,
  },

  components: {
    Button: {
      colorPrimaryHover: lightColors.primaryHover,
      colorPrimaryActive: lightColors.primaryActive,
      primaryShadow: "none",
      defaultShadow: "none",
      fontWeight: 500,
      defaultBg: lightColors.bgContainer,
      defaultColor: lightColors.text,
      defaultBorderColor: lightColors.border,
      defaultHoverBorderColor: lightColors.primary,
      defaultHoverColor: lightColors.primary,
    },

    Layout: {
      bodyBg: lightColors.bgLayout,
      headerBg: lightColors.bgContainer,
      siderBg: lightColors.bgContainer,
      triggerBg: lightColors.bgContainer,
      triggerColor: lightColors.text,
    },

    Menu: {
      itemBg: "transparent",
      itemColor: lightColors.textSecondary,
      itemHoverBg: lightColors.bgFill,
      itemHoverColor: lightColors.primary,
      itemSelectedBg: lightColors.primarySoft,
      itemSelectedColor: lightColors.primary,
      itemActiveBg: lightColors.primarySoft,
      subMenuItemBg: "transparent",
    },

    Card: {
      colorBgContainer: lightColors.bgContainer,
      headerBg: lightColors.bgContainer,
      colorBorderSecondary: lightColors.borderSecondary,
      boxShadowTertiary: lightColors.shadow,
    },

    Table: {
      headerBg: lightColors.tableHeader,
      headerColor: lightColors.textSecondary,
      headerSplitColor: lightColors.border,
      borderColor: lightColors.borderSecondary,
      rowHoverBg: lightColors.bgLayout,
      rowSelectedBg: lightColors.primarySoft,
      rowSelectedHoverBg: lightColors.primarySoftHover,
    },

    Typography: {
      titleMarginBottom: 0,
    },

    Input: {
      activeBorderColor: lightColors.primary,
      hoverBorderColor: lightColors.border,
      activeShadow: lightColors.focusShadow,
    },

    Select: {
      activeBorderColor: lightColors.primary,
      hoverBorderColor: lightColors.border,
      optionSelectedBg: lightColors.primarySoft,
      optionSelectedColor: lightColors.primary,
      optionActiveBg: lightColors.bgFill,
    },

    Modal: {
      contentBg: lightColors.bgContainer,
      headerBg: lightColors.bgContainer,
      titleColor: lightColors.text,
    },

    Tabs: {
      inkBarColor: lightColors.primary,
      itemSelectedColor: lightColors.primary,
      itemHoverColor: lightColors.primary,
      itemActiveColor: lightColors.primaryActive,
    },

    Tag: {
      defaultBg: lightColors.bgFill,
      defaultColor: lightColors.textSecondary,
    },
  },
};

const darkColors = {
  primary: BRAND_PRIMARY,
  primaryHover: "#8377d6",
  primaryActive: "#5d51ba",
  primarySoft: "rgba(110, 98, 205, 0.2)",
  primarySoftHover: "rgba(110, 98, 205, 0.28)",

  success: "#34c28a",
  warning: "#dea838",
  error: "#e85d49",
  info: "#54a6e6",

  bgBase: "#19191e",
  bgLayout: "#19191e",
  bgContainer: "#212128",
  bgElevated: "#28282f",
  bgSpotlight: "#303038",
  bgFill: "#303038",
  tableHeader: "#28282f",

  text: "#f6f6f8",
  textSecondary: "#b0b0b9",
  textTertiary: "#7f7f88",
  textQuaternary: "#616169",

  border: "#4a4a53",
  borderSecondary: "#33333b",

  shadow: "0 12px 32px rgba(0, 0, 0, 0.45)",
  focusShadow: "0 0 0 2px rgba(110, 98, 205, 0.28)",
} as const;

export const darkTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,

  token: {
    ...shared,

    colorSuccess: darkColors.success,
    colorWarning: darkColors.warning,
    colorError: darkColors.error,
    colorInfo: darkColors.info,

    colorBgBase: darkColors.bgBase,
    colorBgLayout: darkColors.bgLayout,
    colorBgContainer: darkColors.bgContainer,
    colorBgElevated: darkColors.bgElevated,
    colorBgSpotlight: darkColors.bgSpotlight,

    colorTextBase: darkColors.text,
    colorText: darkColors.text,
    colorTextSecondary: darkColors.textSecondary,
    colorTextTertiary: darkColors.textTertiary,
    colorTextQuaternary: darkColors.textQuaternary,
    colorTextDisabled: darkColors.textQuaternary,

    colorBorder: darkColors.border,
    colorBorderSecondary: darkColors.borderSecondary,
    colorSplit: darkColors.borderSecondary,

    colorFillSecondary: darkColors.bgFill,
    controlItemBgHover: darkColors.bgFill,
    controlItemBgActive: darkColors.primarySoft,
    colorPrimaryBg: "rgba(110, 98, 205, 0.18)",
    colorPrimaryBgHover: darkColors.primarySoftHover,

    fontSizeHeading1: 32,
    fontSizeHeading2: 24,
    fontSizeHeading3: 20,

    boxShadow: darkColors.shadow,
  },

  components: {
    Button: {
      colorPrimaryHover: darkColors.primaryHover,
      colorPrimaryActive: darkColors.primaryActive,
      primaryShadow: "none",
      defaultShadow: "none",
      fontWeight: 500,
      defaultBg: darkColors.bgContainer,
      defaultColor: darkColors.text,
      defaultBorderColor: darkColors.border,
      defaultHoverBorderColor: darkColors.primary,
      defaultHoverColor: darkColors.primary,
    },

    Layout: {
      bodyBg: darkColors.bgLayout,
      headerBg: darkColors.bgContainer,
      siderBg: darkColors.bgContainer,
      triggerBg: darkColors.bgContainer,
      triggerColor: darkColors.text,
    },

    Menu: {
      itemBg: "transparent",
      itemColor: darkColors.textSecondary,
      itemHoverBg: darkColors.bgFill,
      itemHoverColor: darkColors.primaryHover,
      itemSelectedBg: darkColors.primarySoft,
      itemSelectedColor: "#9a8fe6",
      itemActiveBg: darkColors.primarySoft,
      subMenuItemBg: "transparent",
    },

    Card: {
      colorBgContainer: darkColors.bgContainer,
      headerBg: darkColors.bgContainer,
      colorBorderSecondary: darkColors.borderSecondary,
      boxShadowTertiary: darkColors.shadow,
    },

    Table: {
      headerBg: darkColors.tableHeader,
      headerColor: darkColors.textSecondary,
      headerSplitColor: darkColors.border,
      borderColor: darkColors.borderSecondary,
      rowHoverBg: darkColors.bgFill,
      rowSelectedBg: darkColors.primarySoft,
      rowSelectedHoverBg: darkColors.primarySoftHover,
    },

    Input: {
      activeBorderColor: darkColors.primary,
      hoverBorderColor: darkColors.border,
      activeShadow: darkColors.focusShadow,
    },

    Select: {
      activeBorderColor: darkColors.primary,
      hoverBorderColor: darkColors.border,
      optionSelectedBg: darkColors.primarySoft,
      optionSelectedColor: "#9a8fe6",
      optionActiveBg: darkColors.bgFill,
    },

    Modal: {
      contentBg: darkColors.bgContainer,
      headerBg: darkColors.bgContainer,
      titleColor: darkColors.text,
    },

    Tabs: {
      inkBarColor: darkColors.primaryHover,
      itemSelectedColor: darkColors.primaryHover,
      itemHoverColor: darkColors.primaryHover,
      itemActiveColor: darkColors.primaryActive,
    },

    Tag: {
      defaultBg: darkColors.bgFill,
      defaultColor: darkColors.textSecondary,
    },
  },
};

export const modernSaasTheme = lightTheme;
export const darkModernSaasTheme = darkTheme;

export const createAntdTheme = (mode: ThemeMode): ThemeConfig =>
  mode === "dark" ? darkTheme : lightTheme;
