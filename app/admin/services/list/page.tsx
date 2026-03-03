import { Container, Stack, Typography } from "@mui/material";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { ServicesAdminClient } from "../ServicesAdminClient";

export default async function ServicesAdminListPage() {
  if (process.env.NODE_ENV === "production") notFound();

  const services = await prisma.service.findMany({
    orderBy: [{ category: "asc" }, { title: "asc" }],
  });

  return (
    <main>
      <Container sx={{ py: { xs: 4, md: 6 } }}>
        <Stack spacing={3}>
          <Stack spacing={0.5}>
            <Typography variant="h4" sx={{ fontWeight: 900 }}>
              Список услуг
            </Typography>
          </Stack>

          <ServicesAdminClient
            mode="list"
            initialServices={services.map((s) => ({
              id: s.id,
              category: s.category as "main" | "legal",
              title: s.title,
              price: s.price,
              ctaText: s.ctaText,
              ctaHref: s.ctaHref,
              image: s.image,
              description: s.description,
              highlight: s.highlight,
              badge: s.badge,
              stockBadge: s.stockBadge,
              paletteColor: s.paletteColor,
              icon: s.icon,
              rating: s.rating,
              reviewCount: s.reviewCount,
            }))}
          />
        </Stack>
      </Container>
    </main>
  );
}

