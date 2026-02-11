"use client";

import {
  Box,
  Container,
  Link,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import TelegramIcon from "@mui/icons-material/Telegram";
import { mainServices } from "@/widgets/services/model/mainServices";
import { legalServices } from "@/widgets/services/model/legalServices";

const COMPANY_NAME = "Новые горизонты";
const PHONE = "+7 922 104 75 86";
const TELEGRAM_URL = "https://t.me/+79221047586";

export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "background.default",
        color: (theme) =>
          theme.palette.mode === "dark" ? "common.white" : theme.palette.text.primary,
        pt: { xs: 6, md: 8 },
        pb: 3,
      }}
    >
      <Container>
        <Stack spacing={{ xs: 4, md: 5 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Typography
              component="p"
              sx={{
                fontWeight: 900,
                fontSize: { xs: 32, sm: 40, md: 48 },
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                textTransform: "uppercase",
              }}
            >
              {COMPANY_NAME}
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                flexWrap: "wrap",
              }}
            >
              <Link
                href={`tel:${PHONE.replace(/\s/g, "")}`}
                sx={{
                  color: "secondary.main",
                  fontWeight: 700,
                  fontSize: 18,
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                {PHONE}
              </Link>
              <Link
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                sx={{
                  color: (theme) =>
                    theme.palette.mode === "dark" ? "common.white" : "text.primary",
                  "&:hover": { color: "#0088cc" },
                }}
              >
                <TelegramIcon sx={{ fontSize: 28 }} />
              </Link>
            </Box>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                lg: "minmax(0, max-content) 1fr",
              },
              gap: { xs: 4, md: 6 },
              alignItems: "start",
            }}
          >
            <Stack spacing={1}>
              <Typography variant="overline" sx={{ opacity: 0.8, fontWeight: 700 }}>
                Основные услуги
              </Typography>
              <List dense disablePadding sx={{ listStyle: "none" }}>
                {mainServices.map((item) => (
                  <ListItem key={item.title} disableGutters sx={{ py: 0.25 }}>
                    <ListItemText
                      primary={item.title}
                      primaryTypographyProps={{
                        sx: {
                          fontSize: 14,
                          color: (theme) =>
                            theme.palette.mode === "dark" ? "grey.300" : "text.secondary",
                        },
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Stack>

            <Stack spacing={1} alignItems="flex-start">
              <Typography variant="overline" sx={{ opacity: 0.8, fontWeight: 700 }}>
                Юридические услуги
              </Typography>
              <List
                dense
                disablePadding
                sx={{
                  listStyle: "none",
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                  columnGap: { xs: 0, sm: 2 },
                  alignItems: "start",
                }}
              >
                {legalServices.map((title) => (
                  <ListItem key={title} disableGutters sx={{ py: 0.25, alignItems: "flex-start" }}>
                    <ListItemText
                      primary={title}
                      primaryTypographyProps={{
                        sx: {
                          fontSize: 14,
                          color: (theme) =>
                            theme.palette.mode === "dark" ? "grey.300" : "text.secondary",
                        },
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Stack>
          </Box>

          <Box
            sx={{
              pt: 3,
              borderTop: "1px solid",
              borderColor: (theme) =>
                theme.palette.mode === "dark" ? "grey.700" : "divider",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Typography
              sx={{
                fontSize: 14,
                color: (theme) =>
                  theme.palette.mode === "dark" ? "grey.500" : "text.secondary",
              }}
            >
              Усова Валерия Арсеновна © {year} {COMPANY_NAME}
            </Typography>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};
