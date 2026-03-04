import type { ReactNode } from "react";
import { Header } from "@/widgets/header/ui";
import { Footer } from "@/widgets/footer/ui/Footer";
import { Box } from "@mui/material";

interface Props {
  readonly children: ReactNode;
}

export default function SiteLayout({ children }: Props) {
  return (
    <Box sx={{ minHeight: "100dvh" }}>
      <Box sx={{ position: "fixed", left: 0, top: 0, width: "100%", zIndex: 1200 }}>
        <Header />
      </Box>
      {children}
      <Footer />
    </Box>
  );
}

