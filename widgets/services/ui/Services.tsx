"use client";

import {
  Box,
  Container,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { ServiceCardList } from "@/widgets/services/ui/ServiceCardList";
import type { ServiceRecord } from "@/entities/service";

export const Services = () => {
  const [services, setServices] = useState<ServiceRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/services")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch services");
        return res.json();
      })
      .then(setServices)
      .catch((e) => setError(e instanceof Error ? e.message : "Ошибка загрузки"));
  }, []);

  if (error) {
    return (
      <Box component="section" id="services" sx={{ py: 7 }}>
        <Container>
          <Typography color="error">{error}</Typography>
        </Container>
      </Box>
    );
  }

  if (!services) {
    return (
      <Box component="section" id="services" sx={{ py: 7 }}>
        <Container sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Container>
      </Box>
    );
  }

  const mainServices = services.filter((s) => s.category === "main");
  const legalServices = services.filter((s) => s.category === "legal");

  return (
    <Box
      component="section"
      id="services"
      sx={{
        py: { xs: 7, md: 10 },
        bgcolor: "background.paper",
      }}
    >
      <Container>
        <Stack spacing={{ xs: 6, md: 8 }}>
          <ServiceCardList
            title="Основные услуги"
            subtitle="Работаем с земельными участками: от оформления документов до представительства в суде."
            items={mainServices}
            columns={3}
          />
          <ServiceCardList
            title="Юридические услуги"
            subtitle="Оформление документов, представительство в суде и сопровождение сделок с недвижимостью."
            items={legalServices}
            columns={4}
          />
        </Stack>
      </Container>
    </Box>
  );
}
