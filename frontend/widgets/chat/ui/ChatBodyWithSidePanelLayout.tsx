import type { ReactNode } from "react";
import { Box } from "@mui/material";

type Props = {
  middle: ReactNode;
  right: ReactNode;
  rightWidth?: number;
  stickyTop?: number;
};

export function ChatBodyWithSidePanelLayout({ middle, right, rightWidth = 420, stickyTop = 112 }: Props) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: `minmax(0, 1fr) ${rightWidth}px` },
        gap: 2,
        alignItems: "start",
      }}
    >
      <Box sx={{ minWidth: 0 }}>{middle}</Box>
      <Box
        sx={{
          minWidth: 0,
          position: { lg: "sticky" },
          top: { lg: stickyTop },
          height: { lg: `calc(100dvh - ${stickyTop + 32}px)` },
        }}
      >
        {right}
      </Box>
    </Box>
  );
}

