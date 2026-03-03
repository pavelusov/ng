"use client";

import { Box, Typography, alpha } from "@mui/material";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import Link from "next/link";

const NAV_ITEMS = [
  { label: "Заказы", icon: ShoppingBagOutlinedIcon, href: "#orders" },
  { label: "Избранное", icon: FavoriteBorderRoundedIcon, href: "#favorites" },
  { label: "Профиль", icon: PersonOutlineRoundedIcon, href: "#profile" },
  { label: "Корзина", icon: ShoppingCartOutlinedIcon, href: "#cart" },
] as const;

export const HeaderNav = () => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: { xs: 0, sm: 0.5, md: 1 },
      flex: { xs: "0 0 auto", md: "0 0 auto" },
    }}
  >
    {NAV_ITEMS.map(({ label, icon: Icon, href }) => (
      <Box
        key={label}
        component={Link}
        href={href}
        aria-label={label}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0.25,
          px: { xs: 0.75, sm: 1 },
          py: 0.75,
          borderRadius: 1.5,
          textDecoration: "none",
          "&:hover": {
            color: "primary.main",
            "& .nav-label": { opacity: 1 },
          },
        }}
      >
        <Icon sx={{ fontSize: { xs: 22, sm: 24 }, color: "primary.main" }} />
        <Typography
          color="secondary.main"
          className="nav-label"
          variant="body2"
          sx={{
            display: { xs: "none", md: "block" },
            fontWeight: 600,
            fontSize: 12,
            opacity: 1,
          }}
        >
          {label}
        </Typography>
      </Box>
    ))}
  </Box>
);
