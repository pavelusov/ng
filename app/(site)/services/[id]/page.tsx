import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Box, Button, Container, Paper, Stack, Typography } from "@mui/material";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  let service: { title: string; description: string | null } | null = null;

  try {
    service = await prisma.service.findUnique({
      where: { id },
      select: { title: true, description: true },
    });
  } catch (e) {
    console.error("Error fetching service metadata:", e);
  }

  if (!service) return { title: "Услуга" };
  return {
    title: `${service.title} — Новые горизонты`,
    description: service.description ?? undefined,
  };
}

export default async function ServicePage({ params }: Props) {
  const { id } = await params;
  let service: Awaited<ReturnType<typeof prisma.service.findUnique>> | null = null;

  try {
    service = await prisma.service.findUnique({ where: { id } });
  } catch (e) {
    console.error("Error fetching service:", e);
  }

  if (!service) notFound();

  const shortDescription =
    service.description ??
    (service.category === "main" ? service.title : `${service.title}. ${service.price}.`);

  return (
    <main>
      <Box
        component="section"
        sx={{
          py: { xs: 4, md: 6 },
          bgcolor: "background.default",
        }}
      >
        <Container>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "minmax(320px, 400px) 1fr" },
              gap: { xs: 3, md: 4 },
              alignItems: "start",
            }}
          >
            <Box
              sx={{
                position: "relative",
                width: "100%",
                aspectRatio: "4/3",
                borderRadius: 1.5,
                overflow: "hidden",
                bgcolor: "action.hover",
              }}
            >
              {service.image ? (
                <Image
                  src={service.image}
                  alt=""
                  fill
                  sizes="(max-width: 900px) 100vw, 400px"
                  style={{ objectFit: "cover", objectPosition: "center" }}
                />
              ) : (
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "text.disabled",
                  }}
                >
                  <Typography component="span" variant="h4">
                    Фото
                  </Typography>
                </Box>
              )}
            </Box>

            <Stack spacing={3}>
              <Stack spacing={1.5}>
                <Typography
                  component="h1"
                  variant="h4"
                  sx={{
                    fontWeight: 900,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.2,
                  }}
                  color="primary"
                >
                  {service.title}
                </Typography>
                <Typography
                  sx={{
                    color: "text.secondary",
                    lineHeight: 1.6,
                    maxWidth: 640,
                  }}
                >
                  {shortDescription}
                </Typography>
              </Stack>

              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: 1.5,
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  alignSelf: "flex-start",
                }}
              >
                <Stack spacing={2} alignItems="flex-start">
                  <Typography
                    component="span"
                    sx={{ fontSize: 28, fontWeight: 800 }}
                    color="primary"
                  >
                    {service.price}
                  </Typography>
                  <Link href={service.ctaHref ?? "#contacts"} style={{ textDecoration: "none" }}>
                    <Button
                      component="span"
                      variant="contained"
                      size="large"
                      sx={{
                        fontWeight: 700,
                        textTransform: "none",
                        px: 3,
                        py: 1.25,
                      }}
                    >
                      {service.ctaText}
                    </Button>
                  </Link>
                </Stack>
              </Paper>
            </Stack>
          </Box>
        </Container>
      </Box>
    </main>
  );
}

