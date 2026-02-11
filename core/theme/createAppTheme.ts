import { createTheme } from "@mui/material";
import type { PaletteMode } from "@mui/material";
import { alpha } from "@mui/material/styles";

/**
 * Тёмная тема по референсу hero (закат): тёплое небо + глубокий синий/индиго.
 * Фон на 1–2 шага темнее, акценты из заката (оранжевый/золото + холодный синий).
 */
const TOKENS = {
  dark: {
    bg: "#0F120E",
    paper: "#161A14",
    primary: "#F5A04A",
    secondary: "#8B9A5A",
    info: "#5B7DA8",
    success: "#2DD96A",
    warning: "#F2D100",
    error: "#FF5F7A",
    divider: "rgba(255,255,255,0.08)",
    textPrimary: "rgba(255,255,255,0.94)",
    textSecondary: "rgba(255,255,255,0.68)",
  },
  light: {
    bg: "#F2E8DE",
    paper: "#F7F0E8",
    primary: "#E05E18",
    secondary: "#3E6B4E",
    info: "#3D5A7A",
    success: "#15803D",
    warning: "#D4B000",
    error: "#D91C42",
    divider: "rgba(10, 25, 41, 0.12)",
    textPrimary: "rgba(10, 25, 41, 0.92)",
    textSecondary: "rgba(10, 25, 41, 0.62)",
  },
} as const;

export function createAppTheme(mode: PaletteMode) {
  const t = mode === "dark" ? TOKENS.dark : TOKENS.light;

  return createTheme({
    cssVariables: true,
    palette: {
      mode,
      primary: { main: t.primary, contrastText: mode === "dark" ? "#0B1220" : "#FFFFFF" },
      secondary: {
        main: t.secondary,
        contrastText: mode === "dark" ? "#0B1220" : "#FFFFFF",
      },
      info: {
        main: t.info,
        contrastText: mode === "dark" ? "#0B1220" : "#FFFFFF",
      },
      success: { main: t.success },
      warning: {
        main: t.warning,
        ...(mode === "light" && { contrastText: "#FFFFFF" }),
      },
      error: { main: t.error },
      background: {
        default: t.bg,
        paper: t.paper,
      },
      divider: t.divider,
      text: {
        primary: t.textPrimary,
        secondary: t.textSecondary,
      },
    },
    custom: {
      gradients: {
        sunset:
          mode === "dark"
            ? `linear-gradient(120deg, ${t.warning} 0%, ${t.primary} 40%, #C45A40 70%, #4A2520 100%)`
            : `linear-gradient(120deg, ${t.warning} 0%, ${t.primary} 45%, #D95A40 100%)`,
        sky:
          mode === "dark"
            ? `radial-gradient(1200px 800px at 70% 35%, ${alpha(
                t.secondary,
                0.22,
              )} 0%, ${alpha("#1A7FA2", 0.12)} 35%, ${alpha(t.bg, 0)} 70%)`
            : `radial-gradient(1200px 800px at 70% 35%, ${alpha(
                "#2BA7C6",
                0.22,
              )} 0%, ${alpha(t.secondary, 0.14)} 35%, ${alpha(t.bg, 0)} 70%)`,
        glass:
          mode === "dark"
            ? `linear-gradient(180deg, ${alpha("#FFFFFF", 0.08)} 0%, ${alpha(
                "#FFFFFF",
                0.03,
              )} 100%)`
            : `linear-gradient(180deg, ${alpha(t.primary, 0.06)} 0%, ${alpha(
                t.primary,
                0.02,
              )} 100%)`,
      },
    },
    shape: { borderRadius: 16 },
    typography: {
      fontFamily: ["system-ui", "Segoe UI", "Roboto", "sans-serif"].join(","),
      h1: { fontWeight: 900, letterSpacing: "-0.03em" },
      h2: { fontWeight: 900, letterSpacing: "-0.02em" },
      h3: { fontWeight: 800, letterSpacing: "-0.015em" },
      h4: { fontWeight: 800, letterSpacing: "-0.01em" },
      h5: { fontWeight: 800 },
      h6: { fontWeight: 800 },
      button: { fontWeight: 800 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            // Improve font rendering on dark backgrounds.
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            borderRadius: 14,
            fontWeight: 800,
          },
          outlined: {
            borderWidth: 1,
            borderColor: "currentColor",
          },
          contained: {
            boxShadow: "none",
          },
          containedPrimary: {
            boxShadow: "none",
            "&:hover": { boxShadow: "none" },
          },
          containedSecondary: {
            boxShadow: "none",
            "&:hover": { boxShadow: "none" },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundImage: theme.custom.gradients.glass,
            backgroundColor:
              theme.palette.mode === "dark"
                ? alpha(theme.palette.background.paper, 0.66)
                : alpha(theme.palette.background.paper, 0.82),
            borderBottom: `1px solid ${theme.palette.divider}`,
            backdropFilter: "blur(14px)",
          }),
        },
      },
      MuiLink: {
        defaultProps: {
          underline: "hover",
        },
        styleOverrides: {
          root: ({ theme }) => ({
            color: "inherit",
            textDecorationThickness: "from-font",
            textUnderlineOffset: "0.18em",
            transition: "color 140ms ease, text-decoration-color 140ms ease",
            "&:hover": {
              color: theme.palette.secondary.main,
              textDecorationColor: alpha(theme.palette.secondary.main, 0.8),
            },
          }),
        },
      },
      MuiChip: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: 999,
            fontWeight: 700,
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor:
              theme.palette.mode === "dark"
                ? alpha("#FFFFFF", 0.06)
                : alpha(theme.palette.primary.main, 0.06),
          }),
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 14,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: ({ theme }) => ({
            backgroundColor:
              theme.palette.mode === "dark"
                ? alpha("#0B1220", 0.92)
                : alpha("#0B1220", 0.88),
            border: `1px solid ${alpha("#FFFFFF", theme.palette.mode === "dark" ? 0.12 : 0.08)}`,
            backdropFilter: "blur(10px)",
          }),
          arrow: ({ theme }) => ({
            color:
              theme.palette.mode === "dark"
                ? alpha("#0B1220", 0.92)
                : alpha("#0B1220", 0.88),
          }),
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 14,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
          outlined: ({ theme }) => ({
            borderColor: alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.12 : 0.10),
          }),
        },
      },
    },
  });
}

export const appThemeTokens = TOKENS;

