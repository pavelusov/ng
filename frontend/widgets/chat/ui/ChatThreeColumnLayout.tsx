import type { ReactNode } from "react";
import { Box, Container, Stack } from "@mui/material";

type Props = {
  left: ReactNode;
  middle: ReactNode;
  right: ReactNode;
  leftWidth?: number;
  rightWidth?: number;
  stickyTop?: number;
};

export function ChatThreeColumnLayout({
  left,
  middle,
  right,
  leftWidth = 320,
  rightWidth = 420,
  stickyTop = 112,
}: Props) {
  return (
    <Container maxWidth="xl" sx={{ py: 4, pt: 14, pb: 10 }}>
      <Stack spacing={2}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: `${leftWidth}px minmax(0, 1fr) ${rightWidth}px`,
            },
            gap: 2,
            alignItems: "start",
          }}
        >
          <Box sx={{ minWidth: 0, position: { lg: "sticky" }, top: { lg: stickyTop } }}>{left}</Box>
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
      </Stack>
    </Container>
  );
}

