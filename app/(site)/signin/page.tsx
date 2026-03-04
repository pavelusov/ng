"use client";

import Link from "next/link";
import { Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";

export default function SignInPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        backgroundImage: "url('/hero-bg-house_static_day.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Paper
        elevation={10}
        sx={{
          width: "100%",
          maxWidth: 420,
          p: 4,
          backdropFilter: "blur(3px)",
          backgroundColor: "background.paper",
        }}
      >
        <Stack spacing={2.5}>
          {/* <Typography variant="h4" component="h1" fontWeight={700} align="center" color="text.secondary">
            Аккаунт
          </Typography> */}
          
          <TextField label="Email" type="email" fullWidth autoComplete="email" />
          <TextField
            label="Пароль"
            type="password"
            fullWidth
            autoComplete="current-password"
          />

          <Button variant="contained" size="large" fullWidth color="primary">
            Войти
          </Button>

          <Typography variant="body2" color="text.secondary">
            Нет аккаунта?{" "}
            <Link href="/signup" style={{ color: "inherit", fontWeight: 600 }}>
              Регистрация
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}

