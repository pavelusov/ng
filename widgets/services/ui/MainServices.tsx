"use client";

import { Box, Stack, Typography } from "@mui/material";
import { mainServices } from "@/widgets/services/model/mainServices";
import { MainServiceCard } from "@/widgets/services/ui/MainServiceCard";

export const MainServices = () => {
  return (
    <Stack spacing={{ xs: 2, md: 2.5 }}>
      <Stack spacing={0.75}>
        <Typography component="h2" sx={{ fontWeight: 900, letterSpacing: "-0.01em", fontSize: 28 }} color="primary">
          Основные услуги
        </Typography>
        <Typography sx={{ color: "text.secondary", maxWidth: 860 }}>
          Работаем с земельными участками: от оформления документов до представительства в суде.
        </Typography>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gap: { xs: 2, md: 3 },
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
          alignItems: "stretch",
        }}
      >
        {mainServices.map((item) => (
          <MainServiceCard key={item.title} item={item} />
        ))}
      </Box>
    </Stack>
  );
};

