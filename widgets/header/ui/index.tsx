"use client";

import { AppBar, Box, Toolbar } from "@mui/material";
import { HeaderLogo } from "./HeaderLogo";
import { HeaderSearch } from "./HeaderSearch";
import { HeaderNav } from "./HeaderNav";

export const Header = () => {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        // background: (theme) => theme.custom.bgColors.primary,
        // background: (theme) => theme.custom.gradients.header,
        background: "secondary.main",
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        backdropFilter: "blur(2px)",
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          px: { xs: 1.5, sm: 2 },
          py: 0.5,
          height: { xs: 60, sm: 70 },
          display: "flex",
          flexWrap: "wrap",
          gap: { xs: 1, sm: 0 },
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        
        <HeaderLogo />
        <HeaderSearch />
        <HeaderNav />
      </Toolbar>
    </AppBar>
  );
};
