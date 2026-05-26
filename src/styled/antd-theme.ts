import type { ThemeConfig } from "antd";
import { theme } from "antd";

import type { ThemeMode } from "@/theme/theme-mode.types";
import { BRAND_PRIMARY } from "@/styled/brand";
import { APP_FONT_FAMILY } from "@/styled/constants";

const brandToken = theme.getDesignToken({
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: BRAND_PRIMARY,
    colorInfo: BRAND_PRIMARY,
  },
});

const appColors = {
  primary: brandToken.colorPrimary,
  primaryHover: brandToken.colorPrimaryHover,
  primaryActive: brandToken.colorPrimaryActive,
  primarySoft: brandToken.colorPrimaryBg,

  success: "#10B981",
  successSoft: "#ECFDF5",

  warning: "#F59E0B",
  warningSoft: "#FFFBEB",

  error: "#EF4444",
  errorSoft: "#FEF2F2",

  bgLayout: "#F8FAFC",
  bgContainer: "#FFFFFF",
  bgElevated: "#FFFFFF",

  text: "#0F172A",
  textSecondary: "#475569",
  textTertiary: "#64748B",
  textDisabled: "#94A3B8",

  border: "#E2E8F0",
  borderSecondary: "#e2e1e1",

  shadow: "0 12px 32px rgba(15, 23, 42, 0.08)",
} as const;

export const modernSaasTheme: ThemeConfig = {
  algorithm: theme.defaultAlgorithm,

  token: {
    colorPrimary: BRAND_PRIMARY,
    colorInfo: BRAND_PRIMARY,

    colorSuccess: appColors.success,
    colorWarning: appColors.warning,
    colorError: appColors.error,

    colorBgLayout: appColors.bgLayout,
    colorBgContainer: appColors.bgContainer,
    colorBgElevated: appColors.bgElevated,

    colorTextBase: appColors.text,
    colorText: appColors.text,
    colorTextSecondary: appColors.textSecondary,
    colorTextTertiary: appColors.textTertiary,
    colorTextDisabled: appColors.textDisabled,

    colorBorder: appColors.border,
    colorBorderSecondary: appColors.borderSecondary,
    colorSplit: appColors.borderSecondary,

    fontSize: 14,
    fontSizeHeading1: 32,
    fontSizeHeading2: 24,
    fontSizeHeading3: 20,

    boxShadow: appColors.shadow,
  },

  components: {
    Button: {
      fontWeight: 500,
      primaryShadow: "none",
      defaultShadow: "none",
      defaultBg: appColors.bgContainer,
      defaultColor: appColors.text,
      defaultBorderColor: appColors.border,
      defaultHoverBorderColor: appColors.primary,
      defaultHoverColor: appColors.primary,
    },

    Layout: {
      bodyBg: appColors.bgLayout,
      headerBg: appColors.bgContainer,
      siderBg: appColors.bgContainer,
      triggerBg: appColors.bgContainer,
      triggerColor: appColors.text,
    },

    Menu: {
      itemBg: "transparent",
      itemColor: appColors.textSecondary,
      itemHoverBg: appColors.primarySoft,
      itemHoverColor: appColors.primary,
      itemSelectedBg: appColors.primarySoft,
      itemSelectedColor: appColors.primary,
      itemActiveBg: appColors.primarySoft,
      subMenuItemBg: "transparent",
    },

    Card: {
      colorBgContainer: appColors.bgContainer,
      headerBg: appColors.bgContainer,
      colorBorderSecondary: appColors.borderSecondary,
      boxShadowTertiary: appColors.shadow,
    },

    Table: {
      headerBg: "#F1F5F9",
      headerColor: appColors.textSecondary,
      headerSplitColor: appColors.border,
      borderColor: appColors.borderSecondary,
      rowHoverBg: "#F8FAFC",
      rowSelectedBg: appColors.primarySoft,
      rowSelectedHoverBg: brandToken.colorPrimaryBgHover,
    },

    Input: {
      activeBorderColor: appColors.primary,
      hoverBorderColor: appColors.primary,
      activeShadow: `0 0 0 ${brandToken.controlOutlineWidth}px ${brandToken.controlOutline}`,
    },

    Select: {
      activeBorderColor: appColors.primary,
      hoverBorderColor: appColors.primary,
      optionSelectedBg: appColors.primarySoft,
      optionSelectedColor: appColors.primary,
      optionActiveBg: "#F8FAFC",
    },

    Modal: {
      contentBg: appColors.bgContainer,
      headerBg: appColors.bgContainer,
      titleColor: appColors.text,
    },

    Tabs: {
      inkBarColor: appColors.primary,
      itemSelectedColor: appColors.primary,
      itemHoverColor: appColors.primary,
      itemActiveColor: appColors.primaryActive,
    },

    Tag: {
      defaultBg: "#F8FAFC",
      defaultColor: appColors.textSecondary,
    },
  },
};

const brandTokenDark = theme.getDesignToken({
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: BRAND_PRIMARY,
    colorInfo: BRAND_PRIMARY,
  },
});

const darkAppColors = {
  primary: brandTokenDark.colorPrimary,
  primaryHover: brandTokenDark.colorPrimaryHover,
  primaryActive: brandTokenDark.colorPrimaryActive,
  primarySoft: brandTokenDark.colorPrimaryBg,

  success: "#34D399",
  successSoft: "#064E3B",

  warning: "#FBBF24",
  warningSoft: "#422006",

  error: "#F87171",
  errorSoft: "#450A0A",

  bgLayout: "#0f1117",
  bgContainer: "#151922",
  bgElevated: "#1e2230",

  text: "#E8EAEF",
  textSecondary: "#A8B0C4",
  textTertiary: "#8B93A8",
  textDisabled: "#6B7288",

  border: "#2a3042",
  borderSecondary: "#e2e1e1",

  shadow: "0 12px 32px rgba(0, 0, 0, 0.45)",
} as const;

export const darkModernSaasTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,

  token: {
    colorPrimary: BRAND_PRIMARY,
    colorInfo: BRAND_PRIMARY,

    colorSuccess: darkAppColors.success,
    colorWarning: darkAppColors.warning,
    colorError: darkAppColors.error,

    colorBgLayout: darkAppColors.bgLayout,
    colorBgContainer: darkAppColors.bgContainer,
    colorBgElevated: darkAppColors.bgElevated,

    colorTextBase: darkAppColors.text,
    colorText: darkAppColors.text,
    colorTextSecondary: darkAppColors.textSecondary,
    colorTextTertiary: darkAppColors.textTertiary,
    colorTextDisabled: darkAppColors.textDisabled,

    colorBorder: darkAppColors.border,
    colorBorderSecondary: darkAppColors.borderSecondary,
    colorSplit: darkAppColors.borderSecondary,

    fontSize: 14,
    fontSizeHeading1: 32,
    fontSizeHeading2: 24,
    fontSizeHeading3: 20,

    boxShadow: darkAppColors.shadow,
  },

  components: {
    Button: {
      fontWeight: 500,
      primaryShadow: "none",
      defaultShadow: "none",
      defaultBg: darkAppColors.bgContainer,
      defaultColor: darkAppColors.text,
      defaultBorderColor: darkAppColors.border,
      defaultHoverBorderColor: darkAppColors.primary,
      defaultHoverColor: darkAppColors.primary,
    },

    Layout: {
      bodyBg: darkAppColors.bgLayout,
      headerBg: darkAppColors.bgContainer,
      siderBg: darkAppColors.bgContainer,
      triggerBg: darkAppColors.bgContainer,
      triggerColor: darkAppColors.text,
    },

    Menu: {
      itemBg: "transparent",
      itemColor: darkAppColors.textSecondary,
      itemHoverBg: darkAppColors.primarySoft,
      itemHoverColor: darkAppColors.primary,
      itemSelectedBg: darkAppColors.primarySoft,
      itemSelectedColor: darkAppColors.primary,
      itemActiveBg: darkAppColors.primarySoft,
      subMenuItemBg: "transparent",
    },

    Card: {
      colorBgContainer: darkAppColors.bgContainer,
      headerBg: darkAppColors.bgContainer,
      colorBorderSecondary: darkAppColors.borderSecondary,
      boxShadowTertiary: darkAppColors.shadow,
    },

    Table: {
      headerBg: "#1e2230",
      headerColor: darkAppColors.textSecondary,
      headerSplitColor: darkAppColors.border,
      borderColor: darkAppColors.borderSecondary,
      rowHoverBg: "#242938",
      rowSelectedBg: darkAppColors.primarySoft,
      rowSelectedHoverBg: brandTokenDark.colorPrimaryBgHover,
    },

    Input: {
      activeBorderColor: darkAppColors.primary,
      hoverBorderColor: darkAppColors.primary,
      activeShadow: `0 0 0 ${brandTokenDark.controlOutlineWidth}px ${brandTokenDark.controlOutline}`,
    },

    Select: {
      activeBorderColor: darkAppColors.primary,
      hoverBorderColor: darkAppColors.primary,
      optionSelectedBg: darkAppColors.primarySoft,
      optionSelectedColor: darkAppColors.primary,
      optionActiveBg: "#242938",
    },

    Modal: {
      contentBg: darkAppColors.bgContainer,
      headerBg: darkAppColors.bgContainer,
      titleColor: darkAppColors.text,
    },

    Tabs: {
      inkBarColor: darkAppColors.primary,
      itemSelectedColor: darkAppColors.primary,
      itemHoverColor: darkAppColors.primary,
      itemActiveColor: darkAppColors.primaryActive,
    },

    Tag: {
      defaultBg: "#242938",
      defaultColor: darkAppColors.textSecondary,
    },
  },
};

export const createAntdTheme = (mode: ThemeMode): ThemeConfig => {
  const base = mode === "dark" ? darkModernSaasTheme : modernSaasTheme;
  return {
    ...base,
    token: {
      ...base.token,
      fontFamily: APP_FONT_FAMILY,
    },
  };
};
