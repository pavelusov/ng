"use client";

import { Box, Typography } from "@mui/material";
import Image from "next/image";
import Link from "next/link";

const LOGO_TEXT = "Новые горизонты";

export const HeaderLogo = () => (
  <Box
    component={Link}
    href="/"
    sx={{
      flexShrink: 0,
      mr: { xs: 1, sm: 2 },
      display: "flex",
      alignItems: "center",
      gap: 1,
      textDecoration: "none",
      color: "primary.main",
      "&:hover .header-logo-text": { color: "primary.main" },
    }}
  >
    <Image
      src="/logo.svg"
      alt=""
      width={100}
      height={60}
      style={{ objectFit: "contain" }}
    />
    <Typography
      className="header-logo-text"
      variant="h6"
      sx={{
        fontWeight: 900,
        letterSpacing: "-0.02em",
        color: "primary.main",
        fontSize: { xs: "0.9375rem", sm: "1.125rem" },
        textTransform: "uppercase",
      }}
    >
      {LOGO_TEXT}
    </Typography>
  </Box>
);
