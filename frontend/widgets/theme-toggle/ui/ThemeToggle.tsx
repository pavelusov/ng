"use client";

import { useColorMode } from "@/core/theme/ColorModeContext";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { Box, IconButton, Paper, Tooltip } from "@mui/material";

export const ThemeToggle = () => {
  const { mode, toggleMode } = useColorMode();

  return (
    <Box
      sx={{
        position: "fixed",
        right: 16,
        bottom: 16,
        zIndex: (theme) => theme.zIndex.tooltip + 1,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          borderRadius: 999,
          p: 0.5,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Tooltip title={mode === "dark" ? "Switch to light" : "Switch to dark"}>
          <IconButton
            color="primary"
            onClick={toggleMode}
            aria-label="toggle theme"
            size="large"
          >
            {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>
      </Paper>
    </Box>
  );
};

