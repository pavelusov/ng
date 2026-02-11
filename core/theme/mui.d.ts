import type {} from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Theme {
    custom: {
      gradients: {
        /** Warm gold → orange → teal → deep navy */
        sunset: string;
        /** Subtle teal-to-navy atmospheric gradient */
        sky: string;
        /** Glassy overlay for translucent surfaces */
        glass: string;
      };
    };
  }

  // allow configuration using `createTheme`
  interface ThemeOptions {
    custom?: Theme["custom"];
  }
}

