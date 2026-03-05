"use client";
import { Box, Container, Stack, Typography } from "@mui/material";
import { ServiceCardList } from "@/widgets/services/ui/ServiceCardList";
import { useAppSelector } from "@/core/store/hooks";
import { getLegalServices, getMainServices } from "../model/service.slice";

export const Services = () => {
  const mainServices = useAppSelector(getMainServices);
  const legalServices = useAppSelector(getLegalServices);

  return (
    <Box
      component="section"
      id="services"
      sx={{
        py: { xs: 7, md: 10 },
        bgcolor: "background.default",
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
