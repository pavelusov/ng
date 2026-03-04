"use client";

import Link from "next/link";
import { Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";

export default function SignUpPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        backgroundImage: "url('/hero-bg-house_static.jpg')",
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
          <Typography variant="h4" component="h1" fontWeight={700} align="center" color="text.secondary">
            Регистрация
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            Создайте аккаунт, чтобы начать работу.
          </Typography>

          <TextField label="Имя" fullWidth autoComplete="name" size="medium" />
          <TextField label="Email" type="email" fullWidth autoComplete="email" />
          <TextField
            label="Пароль"
            type="password"
            fullWidth
            autoComplete="new-password"
          />

          <Button variant="contained" size="large" fullWidth>
            Создать аккаунт
          </Button>

          <Typography variant="body2" color="text.secondary">
            Уже есть аккаунт?{" "}
            <Link href="/signin" style={{ color: "inherit", fontWeight: 600 }}>
              Войти
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}

