import { Container, Stack, Typography } from "@mui/material";
import { notFound } from "next/navigation";
import { ServicesAdminClient } from "../ServicesAdminClient";

export default async function ServicesAdminCreatePage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main>
      <Container sx={{ py: { xs: 4, md: 6 } }}>
        <Stack spacing={3}>
          <Stack spacing={0.5}>
            <Typography variant="h4" sx={{ fontWeight: 900 }}>
              Создать услугу
            </Typography>
          </Stack>

          <ServicesAdminClient mode="create" />
        </Stack>
      </Container>
    </main>
  );
}

