"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { CssBaseline, ThemeProvider } from "@mui/material";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { ColorModeProvider, useColorMode } from "@/core/theme/ColorModeContext";
import { createAppTheme } from "@/core/theme/createAppTheme";

interface Props {
  readonly children: ReactNode;
}

const InnerProviders = ({ children }: Props) => {
  const { mode } = useColorMode();
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
};

export const AppProviders = ({ children }: Props) => {
  return (
    <ColorModeProvider>
      <InnerProviders>{children}</InnerProviders>
    </ColorModeProvider>
  );
};

